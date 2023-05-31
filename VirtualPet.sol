 // SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/ConfirmedOwner.sol";
import "./Price.sol";

//Please Visit https://vrf.chain.link/ and choose the subscription model and top up your account for this code to work.
//Please Don't forget to add the ABI and contract address to your front end
//Please Don't foget to add your contract as a consumer in your VRF subscription 
contract VirtualPet is VRFConsumerBaseV2, ConfirmedOwner{

event RequestSent(uint256 requestId, uint32 numWords);
    event RequestFulfilled(uint256 requestId, uint256[] randomWords);

    struct RequestStatus {
        bool fulfilled; // whether the request has been successfully fulfilled
        bool exists; // whether a requestId exists
        uint256[] randomWords;
    }
    mapping(uint256 => RequestStatus)
        public s_requests; /* requestId --> requestStatus */
    VRFCoordinatorV2Interface COORDINATOR;

    // Your subscription ID.
    uint64 s_subscriptionId;

    // past requests Id.
    uint256[] public requestIds;
    uint256 public lastRequestId;

    // The gas lane to use, which specifies the maximum gas price to bump to.
    // For a list of available gas lanes on each network,
    // see https://docs.chain.link/docs/vrf/v2/subscription/supported-networks/#configurations
    bytes32 keyHash = 0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c;

    // Depends on the number of requested values that you want sent to the
    // fulfillRandomWords() function. Storing each word costs about 20,000 gas,
    // so 100,000 is a safe default for this example contract. Test and adjust
    // this limit based on the network that you select, the size of the request,
    // and the processing of the callback request in the fulfillRandomWords()
    // function.
    uint32 callbackGasLimit = 100000;

    // The default is 3, but you can set this higher.
    uint16 requestConfirmations = 3;

    // For this example, retrieve 2 random values in one request.
    // Cannot exceed VRFCoordinatorV2.MAX_NUM_WORDS.
    uint32 numWords = 2;

    /**
     * HARDCODED FOR SEPOLIA
     * COORDINATOR: 0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625
     */
    constructor(
        uint64 subscriptionId
        //uint64 subscriptionId,
        //address oracleAddress
    )
        VRFConsumerBaseV2(0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625)
        ConfirmedOwner(msg.sender)
    {
        COORDINATOR = VRFCoordinatorV2Interface(
            0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625
        );
        s_subscriptionId = subscriptionId;
        priceOracle = 0x7Db4184B05889911FFBae3FaC89803d073Bb0368;
    }

    // Assumes the subscription is funded sufficiently.
    function requestRandomWords()
        public
        onlyOwner
        returns (uint256 requestId)
    {
        // Will revert if subscription is not set and funded.
        requestId = COORDINATOR.requestRandomWords(
            keyHash,
            s_subscriptionId,
            requestConfirmations,
            callbackGasLimit,
            numWords
        );
        s_requests[requestId] = RequestStatus({
            randomWords: new uint256[](0),
            exists: true,
            fulfilled: false
        });
        requestIds.push(requestId);
        lastRequestId = requestId;
        emit RequestSent(requestId, numWords);
        return requestId;
    }

    function fulfillRandomWords(
        uint256 _requestId,
        uint256[] memory _randomWords
    ) internal override {
        require(s_requests[_requestId].exists, "request not found");
        s_requests[_requestId].fulfilled = true;
        s_requests[_requestId].randomWords = _randomWords;
        emit RequestFulfilled(_requestId, _randomWords);
    }

    function getRequestStatus(
        uint256 _requestId
    ) external view returns (bool fulfilled, uint256[] memory randomWords) {
        require(s_requests[_requestId].exists, "request not found");
        RequestStatus memory request = s_requests[_requestId];
        return (request.fulfilled, request.randomWords);
    }

    struct Pet {
        string name;
        uint256 age;
        uint256 hunger;
        uint256 happiness;
        uint256 lastHappinessDecrease;
        uint256 level;
        uint256 gif;
        uint256 price;
        address owner;
        address payable proposedBuyer;
        uint256 proposedPrice;
    }

    mapping(address => uint256[]) private ownedPets;
    mapping(uint256 => Pet) private pets;
    uint256 private petIdCounter;
    address private priceOracle; // Address of the price oracle contract

    event PetCreated(address indexed owner, uint256 indexed petId, string name);
    event PetFed(address indexed owner, uint256 indexed petId, uint256 newHunger);
    event PetPlayed(address indexed owner, uint256 indexed petId, uint256 newHappiness);
    event PetTraded(address indexed from, address indexed to, uint256 indexed petId);
    event PetLeveledUp(address indexed owner, uint256 indexed petId, uint256 newLevel);
    event PetRequestSent(address indexed buyer, uint256 indexed petId, uint256 proposedPrice);
    event PetRequestDenied(address indexed owner, uint256 indexed petId);
    event PetPurchaseProposed(uint256 indexed petId, address indexed buyer, uint256 proposedPrice);
    event PetPurchaseAccepted(uint256 indexed petId, address indexed seller, address indexed buyer, uint256 price);
    event PetPurchaseRejected(uint256 indexed petId, address indexed seller, address indexed buyer);
    modifier onlyOwnr(uint256 petId) {
        require(msg.sender == pets[petId].owner, "Caller is not the owner of the pet.");
        _;
    }


    function createPet(string memory name) public {
        require(bytes(name).length > 0, "Invalid pet name.");

        uint256 petId = petIdCounter + 1;
        uint256 gif = requestRandomWords() % 17;//generateRandomNumber(randomSeed, string(result));
        pets[petId] = Pet(name, 1, 5, 5, block.timestamp, 1, gif, 1, msg.sender,payable(address(0)),1);
        ownedPets[msg.sender].push(petId);
        petIdCounter++;

        emit PetCreated(msg.sender, petId, name);
    }



    function getOwnedPetCount() public view returns (uint256) {
        return ownedPets[msg.sender].length;
    }

    function getOwnedPetHappiness(uint256 petId) public view returns (uint256) {
        require(petExists(petId), "Pet does not exist.");

        return pets[petId].happiness;
    }

    function getOwnedPetHunger(uint256 petId) public view returns (uint256) {
        require(petExists(petId), "Pet does not exist.");

        return pets[petId].hunger;
    }

    function getOwnedPetGif(uint256 petId) public view returns (uint256) {
        require(petExists(petId), "Pet does not exist.");

        return pets[petId].gif;
    }

    function getOwnedPetLevel(uint256 petId) public view returns (uint256) {
        require(petExists(petId), "Pet does not exist.");

        return pets[petId].level;
    }

    function getOwnedPetName(uint256 petId) public view returns (string memory) {
        require(petExists(petId), "Pet does not exist.");

        return pets[petId].name;
    }

    function getOwnedPetPrice(uint256 petId) public view returns (uint256) {
        require(petExists(petId), "Pet does not exist.");

        return pets[petId].price;
    }
    function getOwnedPets() public view returns (uint256[] memory) {
        return ownedPets[msg.sender];
    }


    function getOwnedPetOwner(uint256 petId) public view returns (address) {
        require(petExists(petId), "Pet does not exist.");

        return pets[petId].owner;
    }

    function feedPet(uint256 petId) public onlyOwnr(petId) {
        require(petExists(petId), "Pet does not exist.");

        Pet storage pet = pets[petId];
        pet.hunger -= 1;
          // Increase the price when feeding the pet
        if (pet.hunger < 0) {
            pet.hunger = 0;
        }
        emit PetFed(msg.sender, petId, pet.hunger);
    }

    function playWithPet(uint256 petId) public onlyOwnr(petId) {
        require(petExists(petId), "Pet does not exist.");

        Pet storage pet = pets[petId];
        pet.happiness += 1;
        pet.hunger += 1;
        pet.price += 1; // Increase the price when playing with the pet
        emit PetPlayed(msg.sender, petId, pet.happiness);
    }

    function tradePet(address to, uint256 petId) public onlyOwnr(petId) {
        require(petExists(petId), "Pet does not exist.");

        address from = msg.sender;
        uint256[] storage senderPets = ownedPets[from];
        uint256[] storage receiverPets = ownedPets[to];

        for (uint256 i = 0; i < senderPets.length; i++) {
            if (senderPets[i] == petId) {
                senderPets[i] = senderPets[senderPets.length - 1];
                senderPets.pop();
                receiverPets.push(petId);

                emit PetTraded(from, to, petId);
                return;
            }
        }

        revert("Pet is not owned by the sender.");
    }

  function proposePetPurchase(uint256 petId) public payable {
    require(petExists(petId), "Pet does not exist.");

    Pet storage pet = pets[petId];
    address payable buyer = payable(msg.sender);
    uint256 suggestedPrice = msg.value;

    // Check if the suggested price matches the current price of the pet
    uint256 realPrice = getPriceInEth(pet.price);
    require(suggestedPrice >= realPrice, "Proposed price is too low for the value of the pet");

    // Store the proposed purchase details
    pet.proposedBuyer = buyer;
    pet.proposedPrice = suggestedPrice;

    emit PetPurchaseProposed(petId, buyer, suggestedPrice);
}

function acceptPetPurchase(uint256 petId) internal {
    require(petExists(petId), "Pet does not exist.");

    Pet storage pet = pets[petId];
    address payable seller = payable(msg.sender);

    // Check if the pet has a proposed buyer and price
    require(pet.proposedBuyer != address(0), "No proposed purchase for this pet.");
    require(pet.proposedPrice > 0, "No proposed price for this pet.");

    // Only the seller can accept the purchase
    require(pet.owner == seller, "Only the owner can accept the purchase.");

    address payable buyer = pet.proposedBuyer;
    uint256 price = pet.proposedPrice;

    // Transfer the pet ownership to the buyer
    uint256[] storage sellerPets = ownedPets[seller];
    uint256[] storage buyerPets = ownedPets[buyer];

    for (uint256 i = 0; i < sellerPets.length; i++) {
        if (sellerPets[i] == petId) {
            sellerPets[i] = sellerPets[sellerPets.length - 1];
            sellerPets.pop();
            buyerPets.push(petId);

            pet.owner = buyer;
            pet.proposedBuyer = payable(address(0));
            pet.proposedPrice = 0;

            emit PetTraded(seller, buyer, petId);
            break;
        }
    }

    uint256 realPrice = getPriceInEth(price);
    require(msg.value >= realPrice, "Insufficient funds for the purchase.");

    // Refund any excess payment
    if (msg.value > realPrice) {
        uint256 refundAmount = msg.value - realPrice;
        buyer.transfer(refundAmount);
    }
}

function rejectPetPurchase(uint256 petId) public {
    require(petExists(petId), "Pet does not exist.");

    Pet storage pet = pets[petId];
    address payable seller = payable(msg.sender);

    // Check if the pet has a proposed buyer and price
    require(pet.proposedBuyer != address(0), "No proposed purchase for this pet.");
    require(pet.proposedPrice > 0, "No proposed price for this pet.");

    // Only the seller can reject the purchase
    require(pet.owner == seller, "Only the owner can reject the purchase.");

    address payable buyer = pet.proposedBuyer;
    uint256 price = pet.proposedPrice;

    // Clear the proposed purchase details
    pet.proposedBuyer = payable (address(0));
    pet.proposedPrice = 0;

    // Refund the buyer the proposed price
    buyer.transfer(price);

    emit PetPurchaseRejected(petId, seller, buyer);
}




    function checkLevelUp(uint256 petId) public onlyOwnr(petId) {
        require(petExists(petId), "Pet does not exist.");

        Pet storage pet = pets[petId];

        if (pet.happiness >= 10 && pet.hunger == 0 && pet.level == 1) {
            pet.level += 1;
            pet.hunger = 6;
            pet.happiness = 5;
            pet.price = pet.price * 2;
            emit PetLeveledUp(msg.sender, petId, pet.level);
        }
       else if (pet.happiness >= 10 && pet.hunger == 0 && pet.level == 2) {
            pet.level += 1;
            pet.hunger = 7;
            pet.happiness = 4;
            pet.price = pet.price * 2;
            emit PetLeveledUp(msg.sender, petId, pet.level);
        }
        else if (pet.happiness >= 10 && pet.hunger == 0 && pet.level == 3) {
            pet.level += 1;
            pet.hunger = 8;
            pet.happiness = 3;
            pet.price = pet.price * 2;
            emit PetLeveledUp(msg.sender, petId, pet.level);
        }
       else if (pet.happiness >= 10 && pet.hunger == 0 && pet.level == 4) {
            pet.level += 1;
            pet.hunger = 9;
            pet.happiness = 2;
            pet.price = pet.price * 2;
            emit PetLeveledUp(msg.sender, petId, pet.level);
        }
        else if (pet.happiness >= 10 && pet.hunger == 0 && pet.level == 5) {
            pet.level += 1;
            pet.hunger = 10;
            pet.happiness = 1;
            pet.price = pet.price * 2;
            emit PetLeveledUp(msg.sender, petId, pet.level);
        }
       else if (pet.happiness >= 10 && pet.hunger == 0 && pet.level > 5) {
            pet.level += 1;
            pet.hunger = 11;
            pet.happiness = 0;
            pet.price = pet.price * 2;
            emit PetLeveledUp(msg.sender, petId, pet.level);
        }
    }

    function petExists(uint256 petId) private view returns (bool) {
        return pets[petId].owner != address(0);
    }
function getPriceInEth(uint256 amount) private returns (uint256) {
    PriceOracle prieOracle = new PriceOracle(0x7Db4184B05889911FFBae3FaC89803d073Bb0368);
    uint256 ethPriceInUsd = prieOracle.getEthPriceInUsd();
    return amount * ethPriceInUsd;
}


}
