import hre from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";

async function main() {
  const [signer1] = await hre.ethers.getSigners();

  // Starting scripting
  console.log("###### Deploying ERC20 token contract. ######");

  const Token = await hre.ethers.getContractFactory("Token");

  const token = await Token.deploy(signer1);

  console.log("Token", token);

  const mintAmount = hre.ethers.parseUnits("1000", 18);
  const mintTx = await token.mint(signer1.address, mintAmount);
  await mintTx.wait();
  console.log(`Minted ${mintAmount.toString()} tokens to ${signer1.address}`);


  console.log("######  Deploying the `TokenVesting` ######");

  const TokenVesting = await hre.ethers.getContractFactory("TokenVesting");

  const tokenVesting = await TokenVesting.deploy(token.target);

  console.log("tokenvesting deployed:", tokenVesting);


  console.log(
    "######  Adding a beneficiary to the `TokenVesting` contract with a  schedule ######"
  );

  const startTime = await time.latest();
  const duration = 60 * 60 * 24 * 30;
  const totalAmount = hre.ethers.parseUnits("100", 18);


  const beneficiaryAddress = "0xdF3e18d64BC6A983f673Ab319CCaE4f1a57C7097"; 

  const addBeneficiary = await tokenVesting.connect(signer1).addBeneficiary(
    beneficiaryAddress,
    startTime,
    duration,
    totalAmount
  );

  await addBeneficiary.wait();
  console.log("Beneficiary added successfully:", addBeneficiary);

  console.log("##### Simulate the passage of time  ####")
  await time.increase(duration);

  console.log(
    "##### Claim vested tokens for the beneficiary after advancing time #####"
  );

  const tokenVestingWithBeneficiary = tokenVesting.connect(await hre.ethers.getSigner(beneficiaryAddress));

  const claimToken = await tokenVestingWithBeneficiary.claimTokens();
  await claimToken.wait();
  console.log("Tokens claimed successfully.");
  
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
