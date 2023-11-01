// import { initializeApp } from "firebase-admin/app"
import { Auth, UserRecord, getAuth } from "firebase-admin/auth"
import { User } from "../../business_rules/basic_datastructures";
import * as appdata from "../../data_access/appdata_access";
import { Email } from "../../data_access/import_datastructures";

const ADMIN_UID = "gLwLn9HxwkMwHf28drJGVhRbC1y1";

export async function changeEmail(userId: string, newEmail: string): Promise<boolean> {
    let user: User = await appdata.getUser(userId);
    if (user.documentId === "")
        return false;

    const auth: Auth = getAuth();

    const oldEmail: string = (await auth.getUser(userId)).email!;
    const changeLink: string = await auth.generateVerifyAndChangeEmailLink(
        oldEmail,
        newEmail,
        { url: 'https://tgbfms.web.app' }
    );

    const changeEmail: Email = await composeMessage(user.displayName, newEmail, changeLink);

    return await appdata.setMail(changeEmail);
}

export async function changePassword(userId: string, newPassword: string): Promise<boolean> {
    let user: User = await appdata.getUser(userId);
    if (user.documentId === "")
        return false;

    const auth: Auth = getAuth();

    return auth.updateUser(user.id, {
        password: newPassword
    })
    .then((_) => true)
    .catch((_) => false);
}

export async function changeUsername(oldUsername: string, newUsername: string): Promise<boolean> {
    const auth: Auth = getAuth();
    const adminUser: UserRecord = await auth.getUser(ADMIN_UID);
    const email: Email = composeChangeUserNameEmail(oldUsername, newUsername, adminUser.email!);

    return await appdata.setMail(email);
}

function composeChangeUserNameEmail(oldUsername: string, newUsername: string, adminEmailAdress: string): Email {
    const content: string = oldUsername + " möchte seinen Nutzernamen in "
    + "<i>" + newUsername + "</i> ändern.<br><br>"
    + "<b><a href='https://console.firebase.google.com/project/tgbfms/firestore/data/~2Fusers' target='_blank'>Firestore öffnen</a></b>";
    
    return {
      documentId: "",
      to: adminEmailAdress,
      message: {
          subject: "Antrag Änderung Username",
          html: content
      }
    };
  }

async function composeMessage(userName: string, newEmail: string, confirmationLink: string): Promise<Email> {
    const content: string = "Hi " + userName + "!<br><br>"
        + "Du hast angefordert deine Email-Adresse für TGBFMS zu ändern. "
        + "Um die Änderung deiner Email-Adresse zu bestätigen, klicke auf den Link: "
        + "<br><br><b><a href='" + confirmationLink + "' target='_blank'>Änderung der Email bestätigen</a></b>";

    return {
        documentId: "",
        to: newEmail,
        message: {
            subject: "Änderung deiner Email-Adresse",
            html: content
        }
    };
}


