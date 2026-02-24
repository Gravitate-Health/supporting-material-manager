const multer = require('multer');
const fs = require('fs');
const axios = require('axios');

const minioClient = require("../minioConfig")
const checkDocumentIdentifier = require("../controllers/util/checkDocumentReference");
const { response } = require('express');
const { log } = require('console');


async function testConn (req, res) {

    try {
      const buckets = await minioClient.listBuckets()
      return res.status(200).send({"connection": "OK", "buckets": buckets})
    } catch (err) {
      return res.status(400).send({"connection": "FAILED", "error": err})
    }
}

async function uploadFile (req, res) {
  
  const imageBuffer = req.file.buffer;
  const imageName = req.file.originalname;
  const bucketName = process.env.GH_BUCKET;
  const url = process.env.FHIR_URL + "/DocumentReference"
  const fileInfo = JSON.parse(req.body.fileInfo);

  let fhirId

  const ifExists = await checkDocumentIdentifier(imageName)
  if (ifExists){
    return res.status(400).send({"upload": "FAILED", "error": "The document already exists in the FHIR server"})
  }
  else {

    try {
      const emptyFile = {
        "resourceType": "DocumentReference"
      }
    
      const response = await axios.post(url, emptyFile);
      fhirId = response.data.id
      
    } catch (error) {
        console.error(`Error: ${error}`);
        return res.status(500).send({"upload": "FAILED", "error": error})
    }

    minioClient.putObject(bucketName, imageName, imageBuffer, async function (err, etag) {
      if (err != null) {
        return res.status(500).send({"upload": "FAILED", "error": err})      
      }
      else {
        try {
          const fhir = {
            "resourceType": "DocumentReference",
            "id": `${fhirId}`,
            "meta": {
                "profile": [
                    "http://hl7.eu/fhir/ig/gravitate-health/StructureDefinition/ASM"
                ]
            },
            "text" : {
              "status" : "empty",
              },
            "identifier": [
                {
                    "system": "http://example.org",
                    "value": `${imageName}`
                }
            ],
            "version": "1.0",
            "status": "current",
            "docStatus": "final",
            "subject": {
                "display": `${fileInfo.resourceName}`
            },
            "author": [
                {
                    "display": `${fileInfo.author}`
                }
            ],
            "description": `${fileInfo.description}`,
            "content": [
              
              {
                "attachment": {
                  "contentType": fileInfo.attachment.contentType,
                  "language": fileInfo.attachment.language,
                  "url":  `${req.protocol}://${req.get('host')}/smm/resource/${imageName}`,
                  "size": fileInfo.attachment.size,
                  "title": fileInfo.attachment.title,
                  "creation": fileInfo.attachment.creation,
                  "height": fileInfo.attachment.height,
                  "width": fileInfo.attachment.width,
                  "frames": fileInfo.attachment.frames,
                  "duration": fileInfo.attachment.duration,
                  "pages": fileInfo.attachment.pages
                }
              }
                             
            ]
        }
        
          const put_response = await axios.put(url + "/" + fhirId, fhir);
          return res.status(200).send({"upload": "SUCCESS", "Etag": etag, "fhir_object": put_response.data})

        } catch (error) {
            console.error(`Error: ${error}`);
            return res.status(500).send({"upload": "FAILED", "error": error})
        }
      }
    })
  }
  


}

async function retrieveFile(req,res ){
    const imagetId = parseInt(req.params.id);

    minioClient.bucketExists(process.env.GH_BUCKET, function (err, exists) {
        if (err) {
            return res.status(500).send({"status": "the bucket does not exist", "error": err}) 
        }
        if (exists) {
            // Search in minio and retrieve the file

            // minioClient.presignedUrl('GET', process.env.GH_BUCKET, 'how-to-take.pdf', 60 , function (err, presignedUrl) {
            //   if (err) {
            //     return res.status(500).send({"status": "error creating the link", "error": err}) 
            //   }
            //   console.log(`\n\n${new Date().toLocaleString()} | Method: ${req.method} | URL: ${req.originalUrl} | OUT: ${presignedUrl}`)
            //   return res.status(200).send({"url": presignedUrl})
            // })
            minioClient.getObject(process.env.GH_BUCKET, req.params.id, function (err, dataStream) {
                if (err) {
                    return res.status(500).send({"status": "error retrieving the file", "error": err}) 
                }
                let data = [];
                dataStream.on('data', function(chunk) {
                  data.push(chunk);
                }).on('end', function() {
                  let buffer = Buffer.concat(data);
                  //res.setHeader('Content-Type', 'application/pdf');
                  res.setHeader('Content-Disposition', 'attachment; filename='+`${req.params.id}`);
                  res.setHeader('Content-Length', buffer.length);
                  res.write(buffer);
                  res.end();
                }).on('error', function(err) {
                  console.log(err);
                  res.status(500).send({"status": "error reading the file", "error": err});
                });
                return res.status(200)
            })
        }
    })
}



module.exports = {
    testConn,
    uploadFile,
    retrieveFile
}