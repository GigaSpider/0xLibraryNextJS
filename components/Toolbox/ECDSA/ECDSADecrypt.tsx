import { decryptWithPrivateKey, cipher } from "eth-crypto";
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

const formSchema = z.object({
  yourPrivateKey: z.string().min(1, "Your public key is required"),
  encryptedMessage: z.string().min(1, "Secret message is required"),
});

type FormData = z.infer<typeof formSchema>;

export default function ECDSADecrypt() {
  const [decryptedMessage, setDecryptedMessage] = useState("");

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      yourPrivateKey: "",
      encryptedMessage: "",
    },
  });

  async function onSubmit(data: FormData) {
    const { yourPrivateKey, encryptedMessage } = data;

    const decoded = cipher.parse(encryptedMessage);

    const decrypted = await decryptWithPrivateKey(yourPrivateKey, decoded);

    setDecryptedMessage(decrypted);
  }

  return (
    <div className="m-2">
      <CardTitle className="text-blue-500">
        Elliptic Curve Digital Signature Algorithm Decryption Tool
      </CardTitle>
      <br />
      <div className="mt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="yourPrivateKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Private Key</FormLabel>
                  <FormControl>
                    <Input placeholder="Your private key" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="encryptedMessage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Encrypted Message</FormLabel>
                  <FormControl>
                    <Input placeholder="Encrypted message" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit">Decrypt Message</Button>
          </form>
        </Form>
      </div>
      {decryptedMessage && (
        <div className="mt-4 p-4">
          <div className="text-xs break-all">
            <strong>Decrypted Message:</strong> {decryptedMessage} <br />
          </div>
        </div>
      )}
    </div>
  );
}
