# Makefile

# 'spell-fix' target:
# This target runs the spell check autofix script located in the specified path.
# The script 'codespell-autofix.sh' is expected to check for spelling errors and automatically fix them.
# Ensure that the 'codespell-autofix.sh' script has executable permissions.
#   chmod +x .github/Spell-check-autofix/codespell-autofix.sh
spell-fix:
	./.github/spell-check-autofix/codespell-autofix.sh
