var MedicalAudit = artifacts.require("MedicalAudit");

module.exports = function (deployer) {
    // Déploiement du contrat MedicalAudit
    deployer.deploy(MedicalAudit);
};
