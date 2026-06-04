function setDependency(pkg, dependencyName, version) {
  pkg.dependencies = pkg.dependencies || {};
  if (pkg.dependencies[dependencyName]) {
    pkg.dependencies[dependencyName] = version;
  }
}

module.exports = {
  hooks: {
    readPackage(pkg) {
      if (pkg.name === "@prisma/dev") {
        setDependency(pkg, "@hono/node-server", "^1.19.13");
      }

      if (pkg.name === "@prisma/config") {
        setDependency(pkg, "effect", "^3.20.0");
      }

      if (pkg.name === "bull") {
        setDependency(pkg, "uuid", "^11.1.1");
      }

      return pkg;
    },
  },
};
