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





  // Handle create pet button click
  document.getElementById("createPetButton").onclick = async function() {
    const petName = document.getElementById("petNameInput").value;

    if (petName.trim() !== "") {
      if (!selectedAccount) {
        // Prompt the user to select their wallet address
        const accounts = await web3.eth.requestAccounts();
        selectedAccount = accounts[0];
      }

      // Create the pet
      console.log("4 pet");
      await createPet (petName);

      // Hide the create pet popup
      document.getElementById("createPetPopup").style.display = "none";

      console.log("Pet created successfully");
    } else {
      // Pet name is empty
      console.log("Invalid pet name");
    }
  };
  
  

  // Retrieve the GIF and pet image elements
const gifElements = document.querySelectorAll('.gif');
const petElements = document.querySelectorAll('.pet');

// Array of pet image URLs
const petImages = [
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
    
];

// Function to select a random pet image URL
function getRandomPetImage() {
  const randomIndex = Math.floor(Math.random() * petImages.length);
  return petImages[randomIndex];
}

// Loop through each GIF element and set the source and visibility of the pet image
gifElements.forEach((gifElement, index) => {
  const petElement = petElements[index];
  const randomPetImage = getRandomPetImage();
  
  gifElement.src = gifElement.getAttribute('src');
  petElement.src = randomPetImage;
  petElement.style.display = 'block';
});

async function createPet (petName){

console.log("here");
await contract.methods.createPet(petName).send({ from: selectedAccount });
console.log("here1");
document.getElementById("createPetButton").disabled = false;

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
    }
});
// Wait for the DOM content to load
// Assuming you have an array of pets called 'pets' with their details
// Assuming you have a variable 'web3' initialized with the Web3 object connected to the blockchain network

window.addEventListener('DOMContentLoaded', () => {
  const gifPetContainers = document.querySelectorAll('.gif-pet-container');

  gifPetContainers.forEach((container) => {
    const gifImage = container.querySelector('.gif');
    const petImage = container.querySelector('.pet');

    // Generate a random number between 1 and 3 to select a pet image
    const randomPetIndex = Math.floor(Math.random() * 3) + 1;

    // Set the source of the pet image based on the random number
    petImage.src = `pet${randomPetIndex}.png`;

    // Ensure the pet image is loaded before displaying it
    petImage.addEventListener('load', () => {
      petImage.style.display = 'block';
    });
  });
});



};
});

