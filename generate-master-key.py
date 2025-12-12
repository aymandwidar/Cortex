#!/usr/bin/env python3
"""
Generate a secure master key for Cortex AI Router.

Usage:
    python generate-master-key.py              # Generate and display key
    python generate-master-key.py --update     # Generate and update .env file
    python generate-master-key.py --length 64  # Generate longer key
"""

import secrets
import sys
import os
from pathlib import Path


def generate_key(length: int = 32) -> str:
    """Generate a secure random key."""
    return secrets.token_urlsafe(length)


def update_env_file(new_key: str, env_path: str = ".env") -> bool:
    """Update the master key in .env file."""
    env_file = Path(env_path)
    
    if not env_file.exists():
        print(f"❌ Error: {env_path} file not found")
        return False
    
    # Read current content
    with open(env_file, 'r') as f:
        lines = f.readlines()
    
    # Update the master key line
    updated = False
    new_lines = []
    for line in lines:
        if line.startswith('KIRIO_CORTEX_MASTER_KEY='):
            new_lines.append(f'KIRIO_CORTEX_MASTER_KEY={new_key}\n')
            updated = True
        else:
            new_lines.append(line)
    
    if not updated:
        # Key not found, add it
        new_lines.append(f'\n# Master Key (generated {secrets.token_hex(4)})\n')
        new_lines.append(f'KIRIO_CORTEX_MASTER_KEY={new_key}\n')
    
    # Write back
    with open(env_file, 'w') as f:
        f.writelines(new_lines)
    
    return True


def main():
    """Main function."""
    # Parse arguments
    update_file = '--update' in sys.argv or '-u' in sys.argv
    
    # Get key length
    length = 32
    for i, arg in enumerate(sys.argv):
        if arg in ['--length', '-l'] and i + 1 < len(sys.argv):
            try:
                length = int(sys.argv[i + 1])
            except ValueError:
                print(f"❌ Invalid length: {sys.argv[i + 1]}")
                sys.exit(1)
    
    # Generate key
    new_key = generate_key(length)
    
    print("=" * 70)
    print("🔑 Cortex Master Key Generator")
    print("=" * 70)
    print()
    print("Generated Master Key:")
    print(f"  {new_key}")
    print()
    print(f"Key Length: {len(new_key)} characters")
    print(f"Entropy: ~{length * 8} bits")
    print()
    
    if update_file:
        print("Updating .env file...")
        if update_env_file(new_key):
            print("✅ .env file updated successfully!")
            print()
            print("Next steps:")
            print("  1. Restart the backend:")
            print("     python -m uvicorn cortex.main:app --reload --port 8080")
            print()
            print("  2. Logout and login to Admin UI with new key")
            print()
        else:
            print("❌ Failed to update .env file")
            sys.exit(1)
    else:
        print("To update .env file automatically, run:")
        print(f"  python {sys.argv[0]} --update")
        print()
        print("Or manually update .env:")
        print(f"  KIRIO_CORTEX_MASTER_KEY={new_key}")
        print()
    
    print("⚠️  Security Reminders:")
    print("  • Store this key securely")
    print("  • Never commit it to git")
    print("  • Use Secret Manager for production")
    print("  • Rotate every 90 days")
    print()
    print("=" * 70)


if __name__ == "__main__":
    main()
