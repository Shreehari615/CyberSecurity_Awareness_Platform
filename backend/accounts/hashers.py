"""
SHA-256 password hasher with per-password salt.

Passwords are never stored in plain text. Each hash uses a unique salt
prepended to the SHA-256 digest for basic protection against rainbow tables.
"""
import hashlib
import secrets

from django.contrib.auth.hashers import BasePasswordHasher, mask_hash
from django.utils.crypto import constant_time_compare


class SHA256PasswordHasher(BasePasswordHasher):
    """Hash passwords using SHA-256 with a random salt."""

    algorithm = 'sha256'
    salt_entropy = 128

    def salt(self):
        return secrets.token_hex(16)

    def encode(self, password, salt):
        assert password is not None
        digest = hashlib.sha256((salt + password).encode('utf-8')).hexdigest()
        return f'{self.algorithm}${salt}${digest}'

    def verify(self, password, encoded):
        algorithm, salt, digest = encoded.split('$', 2)
        assert algorithm == self.algorithm
        encoded_2 = self.encode(password, salt)
        return constant_time_compare(encoded, encoded_2)

    def safe_summary(self, encoded):
        algorithm, salt, digest = encoded.split('$', 2)
        return {
            'algorithm': algorithm,
            'salt': mask_hash(salt),
            'hash': mask_hash(digest),
        }

    def must_update(self, encoded):
        return False

    def harden_runtime(self, password, encoded):
        pass
