# NPM Token Setup for Automated Publishing

This document explains how to set up the NPM_TOKEN secret required for automated publishing of the `panel-ui` package.

## Prerequisites

1. An npm account with publishing permissions
2. Admin access to the GitHub repository
3. The package name `panel-ui` available on npm (or your chosen scoped name)

## Step 1: Create NPM Access Token

1. **Log in to npm**: Go to [npmjs.com](https://www.npmjs.com/) and sign in
2. **Navigate to Access Tokens**: Click your profile → "Access Tokens"
3. **Generate New Token**: Click "Generate New Token"
4. **Choose Token Type**: Select "Automation" (for CI/CD use)
5. **Set Permissions**: Ensure it has "Publish" permissions
6. **Copy Token**: Save the token securely (you won't see it again)

### Token Format
The token should look like: `npm_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

## Step 2: Add Secret to GitHub Repository

1. **Go to Repository Settings**: Navigate to your GitHub repository
2. **Access Secrets**: Go to "Settings" → "Secrets and variables" → "Actions"
3. **Add New Secret**: Click "New repository secret"
4. **Configure Secret**:
   - **Name**: `NPM_TOKEN`
   - **Value**: Paste your npm access token
5. **Save**: Click "Add secret"

## Step 3: Verify Configuration

The GitHub Actions workflow (`.github/workflows/release.yml`) is already configured to use this token:

```yaml
- name: Release panel-ui
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
    NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
  run: pnpm -F panel-ui exec -- npx --no-install semantic-release -e semantic-release-monorepo
```

## Step 4: Test the Setup

1. **Make a commit** with conventional commit format (e.g., `feat: add new feature`)
2. **Push to main branch** (or create a PR and merge)
3. **Check GitHub Actions**: The release workflow should trigger automatically
4. **Verify npm**: Check if the package was published to npm

## Troubleshooting

### Common Issues

1. **401 Unauthorized**: Token is invalid or expired
   - Regenerate the npm token
   - Update the GitHub secret

2. **403 Forbidden**: Insufficient permissions
   - Ensure the npm account has publish permissions for the package
   - Check if the package name is available

3. **Package not found**: First-time publishing
   - The first release will create the package on npm
   - Ensure the package name in `package.json` is available

### Token Security

- **Never commit tokens** to the repository
- **Use repository secrets** for secure storage
- **Rotate tokens regularly** for security
- **Use automation tokens** for CI/CD (not personal tokens)

## Package Scoping (Optional)

If you want to publish under a scope (e.g., `@yourorg/panel-ui`):

1. **Update package.json**:
   ```json
   {
     "name": "@yourorg/panel-ui"
   }
   ```

2. **Ensure npm access**: Your npm account must have access to the organization

3. **Update workflow**: No changes needed, the token handles scoped packages

## Next Steps

Once the NPM_TOKEN is configured:
1. The release workflow will automatically publish on semantic release commits
2. Versions are managed automatically based on conventional commits
3. GitHub releases are created with changelogs
4. npm packages are published with proper versioning

For more details on the release process, see [RELEASE_PROCESS.md](./RELEASE_PROCESS.md).
