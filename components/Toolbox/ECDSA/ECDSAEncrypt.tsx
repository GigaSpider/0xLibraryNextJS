import { createIdentity, encryptWithPublicKey, cipher } from "eth-crypto";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

interface ECDSA {
  privateKey: string;
  publicKey: string;
  address: string;
}

// Form validation schema
const formSchema = z.object({
  yourPublicKey: z.string().min(1, "Your public key is required"),
  receiverPublicKey: z.string().min(1, "Receiver public key is required"),
  secretMessage: z.string().min(1, "Secret message is required"),
});

type FormData = z.infer<typeof formSchema>;

export default function ECDSAEncrypt() {
  const [identity, setIdentity] = useState<ECDSA>({
    privateKey: "",
    publicKey: "",
    address: "",
  });
  const [encryptedMessage, setEncryptedMessage] = useState("");

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      yourPublicKey: "",
      receiverPublicKey: "",
      secretMessage: "",
    },
  });

  function handleCreateIdentity() {
    const id: ECDSA = createIdentity();
    setIdentity(id);
    // Auto-fill the form with the generated public key
    form.setValue("yourPublicKey", id.publicKey);
  }

  async function onSubmit(data: FormData) {
    console.log("Form submitted with data:", data);

    const encrypted = await encryptWithPublicKey(
      data.receiverPublicKey,
      data.secretMessage,
    );

    const compressed = cipher.stringify(encrypted);

    setEncryptedMessage(compressed);

    // Example of what you might do:
    // 1. Validate the public keys
    // 2. Encrypt the message using ECDSA
    // 3. Display the encrypted result
    // 4. Handle any errors
  }

  return (
    <div className="m-2">
      <CardTitle className="text-green-400">
        Elliptic Curve Digital Signature Algorithm Encryption Tool
      </CardTitle>
      <br />
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          className="bg-black"
          onClick={handleCreateIdentity}
        >
          Create New Identity
        </Button>
        <span className="text-sm text-gray-500">
          (optional if using existing)
        </span>
      </div>

      {identity.address && (
        <div className="mt-4 p-4">
          <div className="text-xs break-all">
            <strong>Private Key:</strong> {identity.privateKey} <br />
            <br />
            <strong>Public Key:</strong> {identity.publicKey} <br />
            <br />
            <strong>Address:</strong> {identity.address}
          </div>
        </div>
      )}

      <div className="mt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="yourPublicKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Public Key</FormLabel>
                  <FormControl>
                    <Input placeholder="Your public key" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="receiverPublicKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Receiver Public Key</FormLabel>
                  <FormControl>
                    <Input placeholder="Receiver public key" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="secretMessage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Secret Message</FormLabel>
                  <FormControl>
                    <Input placeholder="Secret message" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit">Encrypt Message</Button>
          </form>
        </Form>
      </div>
      {encryptedMessage && (
        <div className="mt-4 p-4">
          <div className="text-xs break-all">
            <strong>Encrypted Message:</strong> {encryptedMessage} <br />
          </div>
        </div>
      )}
    </div>
  );
}
