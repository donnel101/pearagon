const express = require("express");
const readline = require('readline');
const axios = require('axios');

const app = express();
const port = 1802;

app.listen(port, () => console.log(`App is listening to port: ${port}`));

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function getUserInput(promptMessage) {
    return new Promise((resolve, reject) => {
        rl.question(promptMessage, userInput => {
            resolve(userInput);
        });
    });
}

function printTriangle(n) {
    for (let i = 1; i <= n; i++) {
        let row = "";
        for (let j = 1; j <= (n - i); j++) {
            row += " ";
        }
        for (let k = 1; k <= i * 2 - 1; k++) {
            row += "*";
        }
        console.log(row);
    }
}
// Function to create a contact in HubSpot using app token
function createContactInHubSpot(firstName, lastName, email, appToken) {
    // HubSpot API endpoint for creating a contact
    const apiUrl = 'https://api.hubapi.com/crm/v3/objects/contacts';

    // Contact data
    const contactData = {
        properties: {
            firstname: firstName,
            lastname: lastName,
            email: email
        }
    };

    // Sending a POST request to HubSpot API with app token in headers
    fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${appToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(contactData)
    })
    .then(response => {
        if (response.ok) {
            console.log('Contact created successfully in HubSpot.');
        } else {
            console.error('Failed to create contact in HubSpot.');
        }
    })
    .catch(error => {
        console.error('Error creating contact in HubSpot:', error);
    });
}

async function addUser(){
    const firstName = await getUserInput('Enter first name: ');
    const lastName = await getUserInput('Enter last name: ');
    const email = await getUserInput('Enter email: ');
    const appToken = 'pat-na1-04aa2c44-a39c-4355-94b2-889cfd1efbbf'; 

    createContactInHubSpot(firstName, lastName, email, appToken);
}
const appToken = 'pat-na1-04aa2c44-a39c-4355-94b2-889cfd1efbbf'; 

async function getAllHubSpotUsers(appToken) {
    try {
        // console.log('trying');
        const response = await axios.get('https://api.hubapi.com/crm/v3/owners', {
            headers: {
                'Authorization': `Bearer ${appToken}`
            }
        });
        // console.log('res',response.data);
        // Extracting names, emails, and IDs from the response data
        const usersData = response.data.results.map(user => {
            return {
                name: `${user.firstName} ${user.lastName}`,
                email: user.email,
                id: user.id
            };
        });
        return usersData;
    } catch (error) {
        // console.log('nganga')
        throw new Error(`Error fetching HubSpot users: ${error.message}`);
    }
}


// -----------------------------------------------------------------------------------------------------

async function searchContacts(filters, appToken) {
    // console.log(filters,appToken)
    try {
        const response = await axios.post(
            'https://api.hubapi.com/crm/v3/objects/contacts/search',
            {
                filterGroups: [
                    {
                        filters: filters
                    }
                ]
            },
            {
                headers: {
                    'Authorization': `Bearer ${appToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        // console.log(response.data.results[5])

        return response.data.total;
    } catch (error) {
        throw new Error(`Error searching contacts in HubSpot: ${error.message}`);
    }
}

async function main() {
    try {
        // Obtain user input for filters
        // console.log(appToken)
        const lastName = await getUserInput('Enter last name to search: ');

        // Define filters based on user input
        const filters = [
            {
                propertyName: 'lastname',
                operator: 'EQ',
                value: lastName
            }
        ];


        // Search for contacts based on filters
        const totalContacts = await searchContacts(filters, appToken);

        console.log(`Total number of contacts with '${lastName}' lastname : ${totalContacts}`);
    } catch (error) {
        console.error(error.message);
    }
}


async function choose(){
    console.log('');
    console.log('Choose Activity');
    console.log('1.Triangle');
    console.log('2.Add Contact');
    console.log('3.List of Users');
    console.log('4.Search Contact by Lastname');

    let choosen = await getUserInput('Choose Number: ');
    if(choosen == 1){
        await printTriangle(5);
        await choose();
    }else if(choosen == 2){
        await addUser();
        await choose();
    }else if(choosen == 3){
        await getAllHubSpotUsers(appToken)
        .then(users => {
            console.log('List of HubSpot users:');
            console.log(users);
        })
        .catch(error => {
            console.error(error.message);
        });
        await choose();
    }else if(choosen == 4){
        await main();
        await choose();
    }else if(choosen <= 0 || choosen > 4){
        console.log('Choose Again');
        choose();
    }
}
choose();