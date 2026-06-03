module.exports = {
  hooks: {
    readPackage(pkg) {
      if (pkg.name === "next") {
        pkg.dependencies = pkg.dependencies || {};
        pkg.dependencies.postcss = "^8.5.10";
      }

      return pkg;
    },
  },
};
