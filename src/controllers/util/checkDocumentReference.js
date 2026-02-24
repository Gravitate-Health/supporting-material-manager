const axios = require('axios');

//Retuturn true if a file exists in FHIR server
async function checkDocumentIdentifier(identifierValue) {
    const FHIR_URL = process.env.FHIR_URL
    try {
        const response = await axios.get(FHIR_URL+'/DocumentReference?_format=json');
        const documentReferences = response.data;

        for (let entry of documentReferences.entry) {
            if (entry.resource.identifier[0].value == identifierValue) {
                return true;
            }
        }
        return false;

    } catch (error) {
        console.error(`Error: ${error}`);
    }
}

module.exports = checkDocumentIdentifier;
