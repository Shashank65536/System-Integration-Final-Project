const express = require('express');
const axios = require('axios');
exports.summarize = async(req, res) => {
    const apiUrl = 'https://sys-integration-instance.cognitiveservices.azure.com/language/analyze-text/jobs?api-version=2023-11-15-preview';
    const subscriptionKey = '1c5e0cc661944bc3ad307f8b6f6d3fb0'; // Replace with your actual subscription key
    // logic to add multiple texts to documents


    // console.log(req.body.text);
    
    let count = 1;
    const documents = [];

    req.body.forEach(text =>{

        const documentObject = {
            "id":++count,
            "language": "en",
            "text":text.text
        }
        documents.push(documentObject);

    });

    const payload = {
        "displayName": "Document ext Summarization Task Example",
        "analysisInput": {
            "documents": documents
        },
        "tasks": [
            {
                "kind": "AbstractiveSummarization",
                "taskName": "Document Abstractive  Summarization Task 1",
                "parameters": {
                    "summaryLength": "short"
                }
            }
        ]
    };

    // console.log(payload);

    const headers = {
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': subscriptionKey
    };

    try {
        // Send POST request
        const postResponse = await axios.post(apiUrl, payload, { headers: headers });
        const operationLocation = postResponse.headers['operation-location'];

        if (!operationLocation) {
            return res.status(500).send('Operation-Location header is missing in the response');
        }

        // Wait for some time before making the GET request
        console.log('Waiting for the operation to complete...');
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for 5 seconds

        // Send GET request
        const getResult = await axios.get(operationLocation, { headers: headers });
        const result = concatenateTextFields(getResult.data);

        // console.log("gg is ", result.tasks.items[0].results.documents);
        res.send(result);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).send(error.message);
    }
};

function concatenateTextFields(data) {

    const arr = [];
    const docs  = data.tasks.items[0].results.documents;
    docs.forEach(doc => {
        const eachSummary = {};
        eachSummary['summarizedText'] = doc.summaries[0].text;
        
        arr.push(eachSummary);
    });

    return arr;

}

