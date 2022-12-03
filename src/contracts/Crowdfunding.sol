// SPDX-License-Identifier: GLP-3.0

pragma solidity >=0.7.0 <0.9.0;

contract CrowFunding {

    string name;
    bool isFundable;
    uint256 goal;
    uint256 totalFunded;
    address payable projectOwner;

    constructor(){
        name = "Healthy vertical garden";
        isFundable = true;
        goal = 1;
        projectOwner = payable(msg.sender);
    }
    modifier onlyOwner{
        require(msg.sender == projectOwner, "You need to be the owner from this contract to change the goal");_;
    }
    function setGoal(uint256 _goal) public onlyOwner{
        require(goal > 0, "You need to add a goal more than 0");
        goal = _goal;
    }
    function getGoal() public view returns(uint256){
        return goal;
    }
    function setProjectState(bool _isFundable) public onlyOwner{
        isFundable = _isFundable;
    }
    function getProjectState() public view returns(string memory){
        if(isFundable){
            return "Actually project is available";
        }
        return "Actually project isn't available";
    } 
    function fundProject() public onlyOwner payable {
        require(isFundable, "Owner has decided to stop this fundraising for a while. Stay tuned");
        require(totalFunded < goal, "Goal already achieved so you are not be able to fund this anymore");
        require(msg.value != uint(0), "please add some funds to contribuite");
        require(totalFunded + msg.value < goal, "Unable to add more funds, check amount remaining for our goal");
        require(msg.sender != projectOwner, "The owner cannot raise funds for his own project");
        totalFunded += msg.value;
    }
    function getActualFound() public view returns(uint256 remainingFounds){
        remainingFounds = goal - totalFunded;
    } 
    function getName() public view returns(string memory){
        return name;
    }
}