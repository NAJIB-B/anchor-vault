import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey, Keypair } from "@solana/web3.js";
import { AnchorVault } from "../target/types/anchor_vault";
import { expect, assert } from "chai";
import { publicKey } from "@coral-xyz/anchor/dist/cjs/utils";
import { BN } from "bn.js";
// import fs from "fs"
// import path from "path"

// const secretKeyPath = path.resolve("/home/najib/.config/solana/id.json");
// const secreteKey = Uint8Array.from(JSON.parse(fs.readFileSync(secretKeyPath, "utf8")));
// const wallet = Keypair.fromSecretKey(secreteKey)



describe("anchor-vault", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider);

  const program = anchor.workspace.AnchorVault as Program<AnchorVault>;

  const [statePDA, stateBump] = PublicKey.findProgramAddressSync(
    [Buffer.from("state"), provider.wallet.publicKey.toBuffer()],
    program.programId
  );

  const [vaultPDA, vaultBump] = PublicKey.findProgramAddressSync(
    [Buffer.from("vault"), provider.wallet.publicKey.toBuffer()],
    program.programId
  );

  

  it("Is initialized!", async () => {

    await program.methods.initialize().accountsStrict({
      systemProgram: anchor.web3.SystemProgram.programId,
      user: provider.wallet.publicKey,
      state: statePDA,
      vault: vaultPDA
    }).rpc()

    const account = await program.account.vaultState.fetch(statePDA)

    assert.equal(account.stateBump, stateBump);
    assert.equal(account.vaultBump, vaultBump);

  });

  it("deposit lamports", async () => {

    const oneSol = new BN(1000000000);

    await program.methods.deposit(oneSol).accountsStrict({
      systemProgram: anchor.web3.SystemProgram.programId,
      user: provider.wallet.publicKey,
      state: statePDA,
      vault: vaultPDA
    }).rpc()


    const vaultBalance = await provider.connection.getBalance(vaultPDA);

    assert.equal(vaultBalance, 1000000000);
  })

  it("withdraw lamports", async ()=> {

    const someSol = new BN(5000000);

    await program.methods.withdraw(someSol).accountsStrict({
      systemProgram: anchor.web3.SystemProgram.programId,
      user: provider.wallet.publicKey,
      state: statePDA,
      vault: vaultPDA
    }).rpc()

    const vaultBalance = await provider.connection.getBalance(vaultPDA);


    assert.equal(vaultBalance, 995000000);
  })


  it("closes vault", async ()=> {

    await program.methods.close().accountsStrict({
      systemProgram: anchor.web3.SystemProgram.programId,
      user: provider.wallet.publicKey,
      state: statePDA,
      vault: vaultPDA,
    }).rpc()


    const vaultBalance = await provider.connection.getBalance(vaultPDA);

    assert.equal(vaultBalance, 0);

  })
});
