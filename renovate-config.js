module.exports = {
  platform: "github",
  timezone: "America/Toronto",

  extends: ["config:recommended"],

  repositories: [
    "Niceplace/labrador-maison",
    "Niceplace/cv",
    "Niceplace/jardinier",
  ],

  onboarding: false,
  requireConfig: "optional",

  detectHostRulesFromEnv: true,

  configValidationError: true,
  configWarningReuseIssue: false,
};
