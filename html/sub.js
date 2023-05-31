import { contractABI, contractAddress } from './contract.js';
document.addEventListener('DOMContentLoaded', function() {
window.onload = async function() {
  // Initialize web3
  const web3 = new Web3(window.ethereum);
   window.ethereum.enable();
// otherFile.js



// You can now use contractABI and contractAddress variables in this file
// without copy-pasting them explicitly


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
const contract = new web3.eth.Contract(contractABI, contractAddress);
const accounts = await web3.eth.getAccounts();
  selectedAccount = accounts[0];

async function selectPet() {
  const petDropdown = document.getElementById("petDropdown");
  console.log("OUCH");
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
console.log("0");
  const petIndex = document.getElementById("petDropdown").selectedIndex;
  console.log("1");
  console.log(petIndex);
  var p = parseInt(petIndex);
  var p = p + 1;
  console.log(p);
  const petGif = await contract.methods.getOwnedPetGif(p).call();
  console.log("2");
  console.log(petGif);
  const petGifUrl = `${petGif}.gif`; // Replace with the actual path to your local GIFs
  console.log("3");
  console.log(petGifUrl);
  const petGifElement = document.getElementById('petGif');
  petGifElement.src = petGifUrl;
}




function getPetDetails(petId) {
  return new Promise((resolve, reject) => {
    // Assuming you have instantiated your contract object as `contract`
    // Replace `getOwnedPetName`, `getOwnedPetHunger`, `getOwnedPetHappiness`, and `getOwnedPetLevel` with your actual contract methods
    const namePromise = contract.methods.getOwnedPetName(petId).call();
    const hungerPromise = contract.methods.getOwnedPetHunger(petId).call();
    const happinessPromise = contract.methods.getOwnedPetHappiness(petId).call();
    const levelPromise = contract.methods.getOwnedPetLevel(petId).call();

    // Use Promise.all to wait for all the promises to resolve
    Promise.all([namePromise, hungerPromise, happinessPromise, levelPromise])
      .then(([name, hunger, happiness, level]) => {
        // Create an object with the fetched pet details
        const petDetails = {
          name: name,
          hunger: hunger,
          happiness: happiness,
          level: level
        };

        resolve(petDetails);
      })
      .catch((error) => {
        reject("Failed to fetch pet details: " + error);
      });
  });
}

async function displayPets() {
  const petDetailsContainer = document.querySelector('.petDetails');
  const ownedPets = await contract.methods.getOwnedPets().call({ from: selectedAccount });

  ownedPets.forEach((pet) => {
    const petCard = document.createElement('div');
    petCard.className = 'pet-card';

    const petName = document.createElement('div');
    petName.className = 'pet-name';
    petName.textContent = pet.name;

    const petPrice = document.createElement('div');
    petPrice.className = 'pet-price';
    petPrice.textContent = `Price: ${pet.price}`;

    const petGif = document.createElement('img');
     const petGif1 = await contract.methods.getOwnedPetGif().call();
 	 console.log("2.app");
 	 console.log(petGif);

    petCard.appendChild(petName);
    petCard.appendChild(petPrice);
    petCard.appendChild(petGif1);

    petDetailsContainer.appendChild(petCard);
  });
}


displayPets();


};
});


