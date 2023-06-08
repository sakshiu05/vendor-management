const testingRoute = require("./testModuleRoutes");
const clientRoutes = require("./client_routes");
const teamRoutes = require("./team_routes");
const resourceRoutes = require("./resource_routes");
const adminRoutes = require("./admin_routes");
const individualEngineerRoutes = require("./individual_engineer_routes");
const financeRoutes = require("./finance_routes");
const domainRoutes = require("./domain_routes");
const techStackRoutes = require("./techstack_routes");
const hackerEarthRoutes = require("./hacker_earth_routes");
const resourceInterviewRoutes = require("./resource_interview");
const vendorRoutes = require("./vendor_routes");
const leadRoutes = require("./leads_routes");
const resumeRoutes = require("./resume_routes");

module.exports = [
    testingRoute,
    clientRoutes,
    teamRoutes,
    resourceRoutes,
    adminRoutes,
    individualEngineerRoutes,
    financeRoutes,
    domainRoutes,
    techStackRoutes,
    hackerEarthRoutes,
    resourceInterviewRoutes,
    vendorRoutes,
    leadRoutes,
    resumeRoutes,
]