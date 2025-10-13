/**
 * Branch naming convention checker
 * Validates that branch names follow the team's conventions
 */

const { execSync } = require('child_process');

// Get current branch name
function getCurrentBranch() {
  try {
    return execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
  } catch (error) {
    console.error('Failed to get current branch:', error.message);
    process.exit(1);
  }
}

// Validate branch name against convention
function validateBranchName(branchName) {
  // Patterns for different branch types
  const patterns = {
    feature: /^feature\/[a-z0-9-]+$/,
    bugfix: /^bugfix\/[a-z0-9-]+$/,
    hotfix: /^hotfix\/[a-z0-9-]+$/,
    release: /^release\/v\d+\.\d+(\.\d+)?$/,
    main: /^main$/,
    develop: /^develop$/
  };

  // Check if branch name matches any of the patterns
  for (const [type, pattern] of Object.entries(patterns)) {
    if (pattern.test(branchName)) {
      console.log(`✅ Valid ${type} branch: ${branchName}`);
      return true;
    }
  }

  // Print error message with correct format
  console.error('\n❌ Invalid branch name:', branchName);
  console.error('\nBranch name must follow one of these patterns:');
  console.error('- feature/descriptive-name');
  console.error('- bugfix/issue-description');
  console.error('- hotfix/critical-fix');
  console.error('- release/v1.2.3');
  console.error('- main or develop\n');
  console.error('Examples:');
  console.error('  ✓ feature/user-authentication');
  console.error('  ✓ bugfix/login-validation');
  console.error('  ✓ hotfix/security-patch');
  console.error('  ✓ release/v1.2.0');
  console.error('  ✗ feat/new-feature');
  console.error('  ✗ feature_user_profile');
  console.error('  ✗ fix-bug\n');
  
  return false;
}

// Main function
function main() {
  const branchName = getCurrentBranch();
  
  if (!validateBranchName(branchName)) {
    process.exit(1);
  }
}

// Run the script
main();