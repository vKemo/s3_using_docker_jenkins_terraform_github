import React, { useState } from 'react';  //Import useState to set the values
import './App.css';  

function App() {
    //state variables
    const [bucketName, setBucketName] = useState('');  //state for bucket name input
    const [versioning, setVersioning] = useState('');  //state for versioning readio buttons
    const [resultMessage, setResultMessage] = useState('');  //state for result messages
    const [showJenkinsButton, setShowJenkinsButton] = useState(false);  //state for visibility of Jenkins button (now it's false because we are wanting the GitHub success)

        //Function to handle  submission form
        const handleSubmit = async (event) => {
        event.preventDefault();

        
        const repoOwner = 'vKemo';  //GitHub username
        const repoName = 's3Vars';  //GitHub repository name
        const personalAccessToken = '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';  //GitHub API token

        //GitHub (APIURL) for creating a file in the repo
        const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${bucketName}/terraform.tfvars`;

        //file content with bucket name and versioning settings that's will add to the terraform.tfvars
        const fileContent = btoa(`bucket_name="${bucketName}"\nversioning=${versioning}`); //the btoa() method type the string in base-64.

            //commit request for the GitHub
            const requestBody = {
            message: `This repo generated according to the app info`,
            content: fileContent
        };
             //try block to do what GitHub api wants
        try {
        //send a PUT request to GitHub API to create the terraform.tfvars file
        const response = await fetch(apiUrl, {
                method: 'PUT',  //HTTP PUT request to create the file
                headers: {
                    'Authorization': `token ${personalAccessToken}`,  //API token for authentication
                    'Content-Type': 'application/json'  
                },
                body: JSON.stringify(requestBody) //send the request body in JSON format as I defined it in the content type
            });
            //check if the API response is successful
            if (response.ok) {
                //display a message asking the user to verify bucket creation
                setResultMessage('Please verify that you want to create a bucket');
                setShowJenkinsButton(true); //show the jenkins button after pressing the create bucket button and all is good without errors
            } else {
            //to display if there is an existent beucket on the Github on the UI or there is a network error
                const error = await response.json(); 
                setResultMessage('This Bucket name already used, try another name ^-^');
            }
        } catch (error) {
            setResultMessage(`${error.message}`);
        }
    };

        //function to trigger Jenkins pipeline after bucket creation
        const triggerJenkinsPipeline = async (bucketName) => {
        const jenkinsUrl = "http://localhost:8080/job/GitHubs3.2/buildWithParameters"; //jenkins API URL to build with parameters
        const jenkinsUser = "kamaher";  // Jenkins username
        const jenkinsToken = "11ed84caf58222739a2f68082b9b676100";  // Jenkins API

        //to edit the params and build with it
        const params = new URLSearchParams({
            DIR_NAME: bucketName //the bucket name passed as a parameter to the Jenkins job
        });
         
        //try block to do what jenkins api want
        try {
            //send a POST request to build the Jenkins pipeline with the bucket name as a parameter
            const response = await fetch(`${jenkinsUrl}?${params.toString()}`, {
                method: 'POST', //HTTP POST request to trigger the build
                headers: {
                    'Authorization': "Basic " + btoa(`${jenkinsUser}:${jenkinsToken}`)  //jenkins authentication
                }
            });
        //check if the jenkins API response is successful
            if (response.ok) {
               //display the response from jenkins
                const responseText = await response.text();  // Get response text
                console.log(responseText);   //display the response to the console
                
                //inform the user that the bucket will be ready soon
                setResultMessage('Your Bucket is ready to use after 30 seconds');
            
              } else {
                //If response is not successful
                //display a message to ask the user to try again
                setResultMessage('Try again please');
                const responseText = await response.text();  //get error text
                console.log(responseText);  //log error details to console
            }
        } catch (error) {
        //catch any errors during the Jenkins API request and display the error message
        setResultMessage(`Error: ${error.message}`);
        console.error(error);  //display the error details to the console
        }
    };

    return (
        <div className="container">
            <form onSubmit={handleSubmit}>  {/*handleing the form using the const we use in JS*/}
                <label htmlFor="bucketName">Bucket Name:</label>
                <input type="text" id="bucketName" value={bucketName} onChange={(e) => setBucketName(e.target.value)} required 
                //set bucket name on state that we use in JS
                />

                <label style={{ marginBottom: '5%' }} htmlFor="versioning">Versioning:</label><br /><br />
                <label>True: <input type="radio" name="versioning" value="true" checked={versioning === 'true'} onChange={() => setVersioning('true')} required
                    //set versioning on state that we use in JS
                    />
                </label>
                
                <br />
                
                <label>
                    False: <input type="radio" name="versioning" value="false" checked={versioning === 'false'} onChange={() => setVersioning('false')}  required
                        //set versioning on state that we use in JS
                    />
                </label>
                
                <br />

                <button type="submit">Create the bucket</button>  {/*submit button for the form */}
            </form>
            
            <div id="result">{resultMessage}</div>  {/*display result message*/}
            
            {showJenkinsButton && (<br />)}
            
            {showJenkinsButton && (
                
                <button onClick={() => triggerJenkinsPipeline(bucketName)}>Verify</button>  //button to trigger Jenkins pipeline, shown if `showJenkinsButton` is true as in 46
            )}
        </div>
    );
}

export default App;