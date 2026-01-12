# DevContainer Vault Completion Project

The `.devcontainer/.env` file should only be used by the DevContainer to set the values for the Docker host machine. These are the values that are available in the .env.example.

The project has its own .env in the project root. When the vault migration is run in persistent mode there needs to be an option of having the root .env remaining unchanged as part of the vault migration process. When the vault is run in ephemeral mode the root.env file should always remain in place.

The vault migration process should be able to read from the root .env file and write to the root .env file as needed. The vault migration process should not read or write to the .devcontainer/.env file.

Make the changes needed to the scripts in the .devcontainer/scripts to support this functionality.

# Vault setup and migration modifications

The vault setup and migration scripts should not run during the DevContainer setup process. The vault setup and migration scripts should only be run manually by the developer as needed.

Make the changes needed to the scripts in the .devcontainer/scripts to support this functionality.
