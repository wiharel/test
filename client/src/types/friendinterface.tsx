
export interface UserFriends {
  friendId: string;
  userId: string;
  friends: User[];
  friendshipId: string;
  username: string;
  userIconPath: string;
  userStatus: string;
  displayName?: string;
  otpauth_url: string | null;
  twofactor: boolean;
  rankPoints: number;
  
}


export interface sentFriendRequests {
  receiverId: string;
  senderId: string;
  friendshipId: string;
  receiver: User;
}

export interface UserBlock {
  blockId: string;
  blockerId: string;
  blockedId: string;
}

export interface User {
    userId: string;
    username: string;
    userIconPath: string;
    userStatus: string;
    displayName?: string;
    otpauth_url: string | null;
    twofactor: boolean;
    rankPoints: number;
    friends: UserFriends[];
    sentFriendRequests: sentFriendRequests[];
    friend: User;
    friendshipId: string;
    friendId: string;
    blocked: User;
  }