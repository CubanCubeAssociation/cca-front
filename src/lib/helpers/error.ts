import { NotificationService } from "@stores/notification.service";
import { HTTPError } from "ky";

const notification = NotificationService.getInstance();

function getErrorMessage({ code, message }: { code: number; message: string }): string {
  // Error code 4xx
  if (Math.floor(code / 100) === 4) return message;

  if (/duplicate key error/.test(message)) {
    let pos = message.indexOf("dup key:");
    let m = message.slice(pos + 11).match(/([a-zA-Z0-9]+): "([^"]+)"/);
    console.log(m);
    return m ? `El campo "${m[1]}" con valor "${m[2]}" ya está en uso` : "";
  }

  return "";
}

export async function catchAPIError(err: HTTPError) {
  const responseError: { code: number; message: string } = await err.response.json();
  const message = getErrorMessage(responseError);

  console.dir(responseError);
  console.log(`MESSAGE: <${message}>`);

  notification.addNotification({
    header: "Error",
    text: message,
    timeout: 4000,
  });
}
