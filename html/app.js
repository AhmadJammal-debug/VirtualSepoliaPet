import { contractABI, contractAddress } from './contract.js';
document.addEventListener("DOMContentLoaded", function() {
window.onload = async function() {
  // Initialize web3
  const web3 = new Web3(window.ethereum);
  await window.ethereum.enable();
let selectedAccount;
var gifPaths = [
    '0.gif',
    '1.gif',
    '2.gif',
    '3.gif',
    '4.gif',
    '5.gif',
    '6.gif',
    '7.gif',
    '8.gif',
    '9.gif',
    '10.gif',
    '11.gif',
    '12.gif',
    '13.gif',
    '14.gif',
    // Add more GIF file paths as needed
  ];
  // Contract instance
  const contract = new web3.eth.Contract(contractABI, contractAddress);

  // Check if the user has any pets
   const accounts = await web3.eth.getAccounts();
  selectedAccount = accounts[0];
  const petCount = await contract.methods.getOwnedPetCount().call({ from: selectedAccount });
  console.log("petCount:", petCount);
  if (petCount > 0) {
    // User has pets
    console.log("User has pets");
    await loadPetNames();
    await TradeloadPetNames();
    document.getElementById("createPetPopup").style.display = "none";
  } else {
    // User has no pets
    console.log("User has no pets");

    // Show create pet popup
    document.getElementById("createPetPopup").style.display = "block";
  }

  // Declare the selectedAccount variable
  displayFirstPetDetails();





 
  
  
  async function getPetDetails(petId) {
  return new Promise((resolve, reject) => {
    // Assuming you have instantiated your contract object as `contract`
    // Replace `getOwnedPetName`, `getOwnedPetHunger`, `getOwnedPetHappiness`, and `getOwnedPetLevel` with your actual contract methods
    const namePromise = contract.methods.getOwnedPetName(petId).call();
    const hungerPromise = contract.methods.getOwnedPetHunger(petId).call();
    const happinessPromise = contract.methods.getOwnedPetHappiness(petId).call();
    const levelPromise = contract.methods.getOwnedPetLevel(petId).call();
    const PricePromise = contract.methods.getOwnedPetPrice(petId).call();
    console.log("HERE:");
    // Use Promise.all to wait for all the promises to resolve
    Promise.all([namePromise, hungerPromise, happinessPromise, levelPromise, PricePromise])
      .then(([name, hunger, happiness, level, price]) => {
        // Create an object with the fetched pet details
        const petDetails = {
          name: name,
          hunger: hunger,
          happiness: happiness,
          level: level,
          price: price
        };
        

        resolve(petDetails);
        
      })
      .catch((error) => {
        reject("Failed to fetch pet details: " + error);
      });
  });
}

  
  
  async function loadPetNames() {
  const petIds = await contract.methods.getOwnedPets().call({ from: selectedAccount });

  const dropdown = document.getElementById("petDropdown");

  // Clear the dropdown
  dropdown.innerHTML = "";

  for (let i = 0; i < petIds.length; i++) {
    const petId = petIds[i];
    const petName = await contract.methods.getOwnedPetName(petId).call({ from: selectedAccount });

    // Create an option element for each pet
    const option = document.createElement("option");
    option.value = petId;
    option.textContent = petName;

    // Append the option to the dropdown
    dropdown.appendChild(option);
  }
  
}

async function TradeloadPetNames() {
  const petIds = await contract.methods.getOwnedPets().call({ from: selectedAccount });

  const dropdown = document.getElementById("petTradeDropdown");

  // Clear the dropdown
  dropdown.innerHTML = "";

  for (let i = 0; i < petIds.length; i++) {
    const petId = petIds[i];
    const petName = await contract.methods.getOwnedPetName(petId).call({ from: selectedAccount });

    // Create an option element for each pet
    const option = document.createElement("option");
    option.value = petId;
    option.textContent = petName;

    // Append the option to the dropdown
    dropdown.appendChild(option);
  }
  
}




// Handle feed button click
document.getElementById("feedButton").onclick = async function() {
  const selectedPetId = document.getElementById("petDropdown").value;

  // Check if a pet is selected
  if (selectedPetId !== "") {
    try {
      await contract.methods.feedPet(selectedPetId).send({ from: selectedAccount });
      const hunger = await contract.methods.getOwnedPetHunger(selectedPetId).call();
     document.getElementById("petHunger").textContent = "Hunger: " + hunger;
      console.log("Pet fed successfully");
      
    } catch (error) {
      console.log("Failed to feed pet:", error);
    }
  } else {
    console.log("No pet selected");
  }
};
document.getElementById("petDropdown").addEventListener("change", selectPet);

// Handle play button click
document.getElementById("playButton").onclick = async function() {
  const selectedPetId = document.getElementById("petDropdown").value;
  console.log("Pet played with successfully");
  // Check if a pet is selected
  if (selectedPetId !== "") {
    try {
      await contract.methods.playWithPet(selectedPetId).send({ from: selectedAccount });
      const happy = await contract.methods.getOwnedPetHappiness(selectedPetId).call();
      const hunger = await contract.methods.getOwnedPetHunger(selectedPetId).call();
      const price = await contract.methods.getOwnedPetPrice(selectedPetId).call();
     document.getElementById("petHunger").textContent = "Hunger: " + hunger;
      document.getElementById("petHappiness").textContent ="Happiness: " + happy;
      document.getElementById("petPrice").textContent ="Price: " + price;
      console.log("Pet played with successfully");
     
    } catch (error) {
      console.log("Failed to play with pet:", error);
    }
  } else {
    console.log("No pet selected");
  }
};


async function createPet (petName){

console.log("here");
await contract.methods.createPet(petName).send({ from: selectedAccount });
console.log("here1");
document.getElementById("createPetButton").disabled = false;
await loadPetNames();
await TradeloadPetNames();
}

// Get the create pet button element
const createPetButton = document.getElementById("createPetButton");
const petNameInput = document.getElementById("petNameInput");

// Add event listener to the create pet button



// Get the create pet button elements
const createPetButton1 = document.getElementById("createPetButton1");

// Add event listener to the create pet button
document.getElementById("createPetButton1").addEventListener("click", async function() {
    var petName = document.getElementById("petNameInput1").value;
    if (petName) {
        document.getElementById("createPetButton1").disabled = true; // Disable the button to prevent multiple clicks
        console.log("oet 2 ")
        await createPet(petName);
        document.getElementById("createPetPopup").style.display = "none";
        await displayFirstPetDetails();
    }
});
// Wait for the DOM content to load

async function displayFirstPetDetails() {
  // Get the list of owned pets
  const ownedPets = await contract.methods.getOwnedPets().call({ from: selectedAccount });
  // Check if any pets are owned
  if (ownedPets.length > 0) {
    // Get the first pet's details
    
    const petId = ownedPets[0];
    const name = await contract.methods.getOwnedPetName(petId).call();
    const hunger = await contract.methods.getOwnedPetHunger(petId).call();
    const happiness = await contract.methods.getOwnedPetHappiness(petId).call();
    const level = await contract.methods.getOwnedPetLevel(petId).call();
    const price = await contract.methods.getOwnedPetPrice(petId).call();
	await loadPetGif();
    // Update the HTML elements with the pet details
    document.getElementById("petName").textContent = "Name: " + name;
    document.getElementById("petHunger").textContent = "Hunger: " + hunger;
    document.getElementById("petHappiness").textContent = "Happiness: " + happiness;
    console.log("dic");
    document.getElementById("petLevel").textContent = "Level: " + level;
    console.log("dic1");
    document.getElementById("petPrice").textContent = "Price: " + price;
    await selectPet();
    console.log("dic2");
  } else {
    console.log("No pets owned.");
  }
}


async function selectPet() {
  const petDropdown = document.getElementById("petDropdown");
  console.log("aaaaaaaaaaaaaaaaaaaA");
  const petIndex = petDropdown.selectedIndex;
  const petId = petDropdown.options[petIndex].value;
  const petIdex = document.getElementById("petDropdown").selectedIndex;
  console.log("Selected pet index:", petIdex);
  // Assuming you have a function named `getPetDetails` that fetches the pet details from a data source
  getPetDetails(petId)
    .then((selectedPet) => {
      document.getElementById("petName").textContent = `Name: ${selectedPet.name}`;
      document.getElementById("petHunger").textContent = `Hunger: ${selectedPet.hunger}`;
      document.getElementById("petHappiness").textContent = `Happiness: ${selectedPet.happiness}`;
      document.getElementById("petLevel").textContent = `Level: ${selectedPet.level}`;
      document.getElementById("petPrice").textContent = `Price: ${selectedPet.price}`;
      console.log("Price: ", selectedPet.price);
      console.log("ass0");
      loadPetGif();
	console.log("as1s");
      const levelUpButton = document.getElementById("levelUpButton");
      if (selectedPet.level < 5) {
        levelUpButton.style.display = "block";
        levelUpButton.disabled = false;
      } else {
        levelUpButton.style.display = "none";
        levelUpButton.disabled = true;
      }

      document.getElementById("feedButton").disabled = false;
      document.getElementById("playButton").disabled = false;
    })
    .catch((error) => {
      console.log("Error fetching pet details:", error);
    });
}

async function loadPetGif() {
   const petDropdown = document.getElementById("petDropdown");
  
  const petIndex = petDropdown.selectedIndex;
  console.log("1.papp");
  console.log(petIndex);
  var p = parseInt(petIndex);
  var p = p + 1;
  console.log(p);
  const petGif = await contract.methods.getOwnedPetGif(p).call();
  console.log("oo,aa:", petGif);
  const petGifUrl = `${petGif}.gif`; // Replace with the actual path to your local GIFs
  const petGifContainer = document.getElementById('petContainer');
  const petGifElement = document.getElementById('petGif');
  console.log("oo,aa");
  petGifElement.src = petGifUrl;
  
  
  var gif = parseInt(petGif);
  console.log("background: ", petGif);
  let background;
  if ([0, 1, 2, 3, 4, 6, 7, 11, 12, 13].includes(gif)) {
    background = 'green.gif';
  } else if ([5, 8, 9].includes(gif)) {
    background = 'red.gif';
  } else if ([10, 14, 15, 16].includes(gif)) {
    background = 'blue.gif';
  }
  
  // Apply the background to the background container
  const backgroundContainer = document.getElementById('backgroundContainer');
  backgroundContainer.style.background = `url(${background}) no-repeat center`;
  backgroundContainer.style.backgroundSize = 'cover';
  console.log("background: ", background);
}



document.getElementById("levelUpButton").onclick = async function() {
  const selectedPetId = document.getElementById("petDropdown").value;

  // Check if a pet is selected
  if (selectedPetId !== "") {
    try {
      await contract.methods.checkLevelUp(selectedPetId).send({ from: selectedAccount });
      const level = await contract.methods.getOwnedPetLevel(selectedPetId).call();
      const hunger = await contract.methods.getOwnedPetHunger(selectedPetId).call();
    const happiness = await contract.methods.getOwnedPetHappiness(selectedPetId).call();
    const price = await contract.methods.getOwnedPetPrice(petId).call();
      document.getElementById("petLevel").textContent = "Level: " + level;
      document.getElementById("petHunger").textContent = "Hunger: " + hunger;
      document.getElementById("petHappiness").textContent = "Happiness: " + happiness;
      document.getElementById("petPrice").textContent = "Price: " + price;
      console.log("Pet leveled up successfully");
    } catch (error) {
      console.log("Failed to level up pet:", error);
    }
  } else {
    console.log("No pet selected");
  }
};

// Assuming you have an array of pets called 'pets' with their details
// Assuming you have a variable 'web3' initialized with the Web3 object connected to the blockchain network
const tradeButton = document.getElementById('tradeButton');
    tradeButton.addEventListener('click', tradePet);
// Function to trade a pet
async function tradePet() {
    const recipientAddress = document.getElementById('tradeAddressInput').value;
    const petTradeDropdown = document.getElementById('petTradeDropdown');
    const selectedPetIndex = petTradeDropdown.value;

    // Validate recipient address and selected pet
    if (recipientAddress.trim() === '' || selectedPetIndex === '') {
        alert('Please enter recipient address and select a pet to trade.');
        return;
    }

    // Retrieve the selected pet from the array
  

    // Get the current user's account from MetaMask
    const accounts = await web3.eth.requestAccounts();
    const userAccount = accounts[0];

    try {
        
        await contract.methods.tradePet(recipientAddress, selectedPetIndex).send({ from: userAccount });

        // Clear the form after trading
        document.getElementById('tradeAddressInput').value = '';
        petTradeDropdown.selectedIndex = 0; // Reset the dropdown to the default option

        // Display a success message or perform any additional actions
        alert(`Successfully traded ${selectedPet.name} to ${recipientAddress}!`);
    } catch (error) {
        console.error(error);
        alert('An error occurred while trading the pet. Please try again.');
    }
}



};
});

