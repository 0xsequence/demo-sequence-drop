import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SequenceDrop is ERC1155, Ownable {

    address public minterAddress;

    modifier onlyMinter {
        require(msg.sender == minterAddress);
        _;
    }

    constructor() public ERC1155("https://bafybeie2pni4xma557fouywxhchhehpzydjhvj2lv6wjbn5b2jiuighqkm.ipfs.nftstorage.link/{id}.json") {
        _mint(address(this), 0, 1000, "");
        _mint(address(this), 1, 1000, "");
        _mint(address(this), 2, 1000, "");
        _mint(address(this), 3, 1000, "");
        _mint(address(this), 4, 1000, "");
        _mint(address(this), 5, 1000, "");
        _mint(address(this), 6, 1000, "");
        _mint(address(this), 7, 1000, "");
        _mint(address(this), 8, 1000, "");
        _mint(address(this), 9, 1000, "");
        _mint(address(this), 10, 1000, "");
        _mint(address(this), 11, 1000, "");
        _mint(address(this), 12, 1000, "");
        _mint(address(this), 13, 1000, "");
        _mint(address(this), 14, 1000, "");
        _mint(address(this), 15, 1000, "");
        // ..
    }

    function setMinter(address minterAddress_) onlyOwner public {
        minterAddress = minterAddress_;
    }

    function claim(address contractAddress_, address address_, uint id_) onlyMinter public {
        IERC1155(contractAddress_).safeTransferFrom(address(this), address_, id_, 1, "");
    }
}