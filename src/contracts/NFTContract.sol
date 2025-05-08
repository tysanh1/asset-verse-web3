
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title SimpleNFT
 * @dev ERC721 token with storage for token URIs
 */
contract SimpleNFT is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    
    // Events
    event NFTMinted(address indexed to, uint256 indexed tokenId, string tokenURI);

    constructor() ERC721("SimpleNFT", "SNFT") Ownable(msg.sender) {}

    /**
     * @dev Mints a new token and sets its token URI
     * @param to The address that will own the minted token
     * @param tokenURI The token URI to be set
     * @return The ID of the newly minted token
     */
    function mint(address to, string memory tokenURI) public returns (uint256) {
        uint256 newTokenId = _tokenIds.current();
        
        _mint(to, newTokenId);
        _setTokenURI(newTokenId, tokenURI);
        
        _tokenIds.increment();
        
        emit NFTMinted(to, newTokenId, tokenURI);
        
        return newTokenId;
    }
    
    /**
     * @dev Returns the current token ID counter value
     */
    function getCurrentTokenId() public view returns (uint256) {
        return _tokenIds.current();
    }
}
