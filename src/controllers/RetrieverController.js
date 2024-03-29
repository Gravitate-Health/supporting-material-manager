const multer = require('multer');
const fs = require('fs');

const minioClient = require("../minioConfig")


const fhir = {
    "resourceType" : "DocumentReference",
    "id" : "asm-2",
    "meta" : {
      "profile" : [
        "http://hl7.eu/fhir/ig/gravitate-health/StructureDefinition/ASM"
      ]
    },
    "text" : {
      "status" : "generated",
      "div" : "<div xmlns=\"http://www.w3.org/1999/xhtml\"><p><b>Generated Narrative: DocumentReference</b><a name=\"asm-2\"> </a></p><div style=\"display: inline-block; background-color: #d9e0e7; padding: 6px; margin: 4px; border: 1px solid #8da1b4; border-radius: 5px; line-height: 60%\"><p style=\"margin-bottom: 0px\">Resource DocumentReference &quot;asm-2&quot; </p><p style=\"margin-bottom: 0px\">Profile: <a href=\"StructureDefinition-ASM.html\">Additional Support Material Profile</a></p></div><p><b>identifier</b>: <code>http://example.org</code>/2</p><p><b>version</b>: 1.0</p><p><b>status</b>: current</p><p><b>docStatus</b>: final</p><p><b>subject</b>: <span>: Xarelto</span></p><p><b>author</b>: <span>: X-Plain Patient Education</span></p><p><b>description</b>: This patient education program explains Xarelto. Xarelto is also known as rivaroxaban. The program includes the following sections: what are the benefits of Xarelto, what are the risks of Xarelto, how does one take Xarelto, what are special considerations for Xarelto and when should you call your health care provider.</p><blockquote><p><b>content</b></p><h3>Attachments</h3><table class=\"grid\"><tr><td style=\"display: none\">-</td><td><b>ContentType</b></td><td><b>Language</b></td><td><b>Url</b></td><td><b>Duration</b></td></tr><tr><td style=\"display: none\">*</td><td>audio/mpeg</td><td>en</td><td><a href=\"https://www.youtube.com/watch?v=nJxoFG9Y8xE\">https://www.youtube.com/watch?v=nJxoFG9Y8xE</a></td><td>715</td></tr></table></blockquote></div>"
    },
    "identifier" : [
      {
        "system" : "http://example.org",
        "value" : "2"
      }
    ],
    "version" : "1.0",
    "status" : "current",
    "docStatus" : "final",
    "subject" : {
      "display" : "Xarelto"
    },
    "author" : [
      {
        "display" : "X-Plain Patient Education"
      }
    ],
    "description" : "This patient education program explains Xarelto. Xarelto is also known as rivaroxaban. The program includes the following sections: what are the benefits of Xarelto, what are the risks of Xarelto, how does one take Xarelto, what are special considerations for Xarelto and when should you call your health care provider.",
    "content" : [
      {
        "attachment" : {
          "contentType" : "audio/mpeg",
          "language" : "en",
          "url" : "https://www.youtube.com/watch?v=nJxoFG9Y8xE",
          "duration" : 715
        }
      }
    ]
  }

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
  

  minioClient.putObject(process.env.GH_BUCKET, req.file.originalname, imageBuffer, function (err, etag) {
    if (err != null) {
      return res.status(500).send({"upload": "FAILED", "error": err})      
    }
    else {
      return res.status(200).send({"upload": "SUCCESS", "Etag": etag})
    }
  })
}

async function retrieveFile(req,res ){
    const imageBuffer = parseInt(req.params.id);

    minioClient.bucketExists(process.env.GH_BUCKET, function (err, exists) {
        if (err) {
            return res.status(500).send({"status": "the bucket does not exist", "error": err}) 
        }
        if (exists) {
            return res.status(200).send({"status": "bucket exists", "id":imageBuffer})
        }
    })
}



module.exports = {
    testConn,
    uploadFile,
    retrieveFile
}