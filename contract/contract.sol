// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract EthLocker {
    struct Claim {
        uint256 amount;
        uint256 timestamp;
    }

    struct Transaction {
        address sender;
        uint256 amount;
        uint256 claimedAmount;
        address[] claimers;
        mapping(address => Claim[]) claims;
    }

    mapping(bytes32 => Transaction) public transactions;

    // New mapping to store transaction hashes for each sender
    mapping(address => bytes32[]) public senderTransactions;

    event EthLocked(bytes32 indexed transactionHash, address indexed sender, uint256 amount);
    event EthClaimed(bytes32 indexed transactionHash, address indexed recipient, uint256 amount, uint256 timestamp);

    // Function for the sender to lock ETH and generate a transaction hash
    function lockEth() external payable returns (bytes32) {
        require(msg.value > 0, "Must send some ETH");

        // Create a unique hash for this transaction
        bytes32 transactionHash = keccak256(abi.encodePacked(msg.sender, msg.value, block.timestamp));

        // Store the transaction details
        Transaction storage txn = transactions[transactionHash];
        txn.sender = msg.sender;
        txn.amount = msg.value;
        txn.claimedAmount = 0;

        // Add the transaction hash to the sender's list
        senderTransactions[msg.sender].push(transactionHash);

        // Emit event for locked ETH
        emit EthLocked(transactionHash, msg.sender, msg.value);

        // Return the transaction hash (to be written to the NFC tag)
        return transactionHash;
    }

    // Function for the recipient to claim ETH by scanning NFC and providing the transaction hash
    function claimEth(bytes32 transactionHash, uint256 requestedAmount) external {
        Transaction storage txn = transactions[transactionHash];

        // Ensure the transaction exists
        require(txn.sender != address(0), "Transaction does not exist");
        require(requestedAmount <= (txn.amount - txn.claimedAmount), "Requested amount exceeds available ETH");

        // Update the claimed amount
        txn.claimedAmount += requestedAmount;

        // Add the claimer to the list if they haven't claimed before
        if (txn.claims[msg.sender].length == 0) {
            txn.claimers.push(msg.sender);
        }
        txn.claims[msg.sender].push(Claim(requestedAmount, block.timestamp));

        // Transfer ETH to the recipient
        (bool success, ) = msg.sender.call{value: requestedAmount}("");
        require(success, "ETH transfer failed");

        // Emit event for claimed ETH
        emit EthClaimed(transactionHash, msg.sender, requestedAmount, block.timestamp);
    }

    function getTransaction(bytes32 transactionHash) external view returns (address, uint256, uint256, address[] memory) {
        Transaction storage txn = transactions[transactionHash];
        return (txn.sender, txn.amount, txn.claimedAmount, txn.claimers);
    }

    function getClaimHistory(bytes32 transactionHash, address claimer) external view returns (uint256[] memory, uint256[] memory) {
        Transaction storage txn = transactions[transactionHash];
        Claim[] storage claims = txn.claims[claimer];
        uint256[] memory amounts = new uint256[](claims.length);
        uint256[] memory timestamps = new uint256[](claims.length);
        
        for (uint i = 0; i < claims.length; i++) {
            amounts[i] = claims[i].amount;
            timestamps[i] = claims[i].timestamp;
        }
        
        return (amounts, timestamps);
    }

    function getLockedEthAmount(bytes32 transactionHash) external view returns (uint256) {
        Transaction storage txn = transactions[transactionHash];
        require(txn.sender != address(0), "Transaction does not exist");
        return txn.amount - txn.claimedAmount;
    }

    // New function to get all transaction hashes for a given address
    function getTransactionHashesBySender(address sender) external view returns (bytes32[] memory) {
        return senderTransactions[sender];
    }

    // Fallback function to accept ETH directly
    receive() external payable {}
}
