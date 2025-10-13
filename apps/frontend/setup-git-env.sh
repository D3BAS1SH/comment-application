#!/usr/bin/env bash

# Setup Git hooks and configurations for the project
# Run this script after cloning the repository

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Setting up Git environment for the frontend project...${NC}"

# Install Node dependencies
echo -e "${YELLOW}Installing Node dependencies...${NC}"
npm install || { echo -e "${RED}Failed to install dependencies${NC}"; exit 1; }

# Setup Husky
echo -e "${YELLOW}Setting up Husky git hooks...${NC}"
npx husky install || { echo -e "${RED}Failed to install Husky${NC}"; exit 1; }

# Make hook files executable
echo -e "${YELLOW}Making hook files executable...${NC}"
chmod +x .husky/pre-commit
chmod +x .husky/commit-msg
chmod +x .husky/prepare-commit-msg
chmod +x .husky/pre-push

# Configure local Git settings
echo -e "${YELLOW}Configuring Git settings for this repository...${NC}"
git config --local include.path ../.gitconfig
git config --local commit.template .github/commit-template

# Check branch naming convention script
echo -e "${YELLOW}Testing branch naming convention script...${NC}"
node scripts/branch-check.js || echo -e "${YELLOW}Branch name doesn't match convention. This is just a test, no worries.${NC}"

# Final message
echo -e "${GREEN}✅ Git environment set up successfully!${NC}"
echo -e "${BLUE}Your repository is now configured with:${NC}"
echo -e "  • Pre-commit hooks for linting and formatting"
echo -e "  • Commit message validation"
echo -e "  • Branch naming conventions"
echo -e "  • Pull request templates"
echo -e "  • CI/CD workflows"
echo -e "${YELLOW}See GIT_WORKFLOW.md for our branching strategy and best practices${NC}"