// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract EthLocker {
    struct Transaction {
        address sender;
        uint256 amount;
        uint256 claimedAmount; // Track how much has been claimed
        address[] claimers;     // List of addresses that claimed ETH
        mapping(address => uint256) claims; // Amount claimed by each address
    }

    mapping(bytes32 => Transaction) public transactions;

    event EthLocked(bytes32 indexed transactionHash, address indexed sender, uint256 amount);
    event EthClaimed(bytes32 indexed transactionHash, address indexed recipient, uint256 amount);

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
        if (txn.claims[msg.sender] == 0) {
            txn.claimers.push(msg.sender);
        }
        txn.claims[msg.sender] += requestedAmount;

        // Transfer ETH to the recipient
        (bool success, ) = msg.sender.call{value: requestedAmount}("");
        require(success, "ETH transfer failed");

        // Emit event for claimed ETH
        emit EthClaimed(transactionHash, msg.sender, requestedAmount);
    }

    function getTransaction(bytes32 transactionHash) external view returns (address, uint256, uint256, address[] memory) {
        Transaction storage txn = transactions[transactionHash];
        return (txn.sender, txn.amount, txn.claimedAmount, txn.claimers);
    }

    function getClaimAmount(bytes32 transactionHash, address claimer) external view returns (uint256) {
        return transactions[transactionHash].claims[claimer];
    }

    // New function to view the locked ETH amount for a specific transaction hash
    function getLockedEthAmount(bytes32 transactionHash) external view returns (uint256) {
        Transaction storage txn = transactions[transactionHash];
        require(txn.sender != address(0), "Transaction does not exist");
        return txn.amount - txn.claimedAmount;
    }

    // Fallback function to accept ETH directly
    receive() external payable {}
}
