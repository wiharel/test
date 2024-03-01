-- CreateEnum
CREATE TYPE "Status" AS ENUM ('online', 'offline', 'ingame');

-- CreateEnum
CREATE TYPE "ChanType" AS ENUM ('public', 'private', 'protected');

-- CreateTable
CREATE TABLE "User" (
    "userId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "userIconPath" TEXT NOT NULL DEFAULT 'default.jpg',
    "userStatus" "Status" NOT NULL DEFAULT 'offline',
    "displayName" TEXT,
    "otpauth_url" TEXT,
    "twofactor" BOOLEAN NOT NULL DEFAULT false,
    "rankPoints" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "User_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "UserFriends" (
    "userId" TEXT NOT NULL,
    "friendId" TEXT NOT NULL,

    CONSTRAINT "UserFriends_pkey" PRIMARY KEY ("userId","friendId")
);

-- CreateTable
CREATE TABLE "Channel" (
    "chanId" TEXT NOT NULL,
    "chanName" TEXT NOT NULL,
    "chanType" "ChanType" NOT NULL,
    "chanPassword" TEXT,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Channel_pkey" PRIMARY KEY ("chanId")
);

-- CreateTable
CREATE TABLE "ChannelMessage" (
    "messageId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "senderId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,

    CONSTRAINT "ChannelMessage_pkey" PRIMARY KEY ("messageId")
);

-- CreateTable
CREATE TABLE "DirectMessage" (
    "dmId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,

    CONSTRAINT "DirectMessage_pkey" PRIMARY KEY ("dmId")
);

-- CreateTable
CREATE TABLE "Game" (
    "gameId" TEXT NOT NULL,
    "rightPlayerId" TEXT NOT NULL,
    "leftPlayerId" TEXT NOT NULL,
    "rightPlayerScore" INTEGER NOT NULL,
    "leftPlayerScore" INTEGER NOT NULL,
    "winnerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("gameId")
);

-- CreateTable
CREATE TABLE "FriendRequest" (
    "requestId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FriendRequest_pkey" PRIMARY KEY ("requestId")
);

-- CreateTable
CREATE TABLE "Achievements" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "Achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ChannelMembers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_BannedUsers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_ChannelAdministrators" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_ChannelInvites" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_MutedUsers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_AchievementsToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Achievements_title_key" ON "Achievements"("title");

-- CreateIndex
CREATE UNIQUE INDEX "_ChannelMembers_AB_unique" ON "_ChannelMembers"("A", "B");

-- CreateIndex
CREATE INDEX "_ChannelMembers_B_index" ON "_ChannelMembers"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_BannedUsers_AB_unique" ON "_BannedUsers"("A", "B");

-- CreateIndex
CREATE INDEX "_BannedUsers_B_index" ON "_BannedUsers"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ChannelAdministrators_AB_unique" ON "_ChannelAdministrators"("A", "B");

-- CreateIndex
CREATE INDEX "_ChannelAdministrators_B_index" ON "_ChannelAdministrators"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ChannelInvites_AB_unique" ON "_ChannelInvites"("A", "B");

-- CreateIndex
CREATE INDEX "_ChannelInvites_B_index" ON "_ChannelInvites"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_MutedUsers_AB_unique" ON "_MutedUsers"("A", "B");

-- CreateIndex
CREATE INDEX "_MutedUsers_B_index" ON "_MutedUsers"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_AchievementsToUser_AB_unique" ON "_AchievementsToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_AchievementsToUser_B_index" ON "_AchievementsToUser"("B");

-- AddForeignKey
ALTER TABLE "UserFriends" ADD CONSTRAINT "UserFriends_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFriends" ADD CONSTRAINT "UserFriends_friendId_fkey" FOREIGN KEY ("friendId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Channel" ADD CONSTRAINT "Channel_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChannelMessage" ADD CONSTRAINT "ChannelMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChannelMessage" ADD CONSTRAINT "ChannelMessage_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("chanId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DirectMessage" ADD CONSTRAINT "DirectMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DirectMessage" ADD CONSTRAINT "DirectMessage_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_rightPlayerId_fkey" FOREIGN KEY ("rightPlayerId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_leftPlayerId_fkey" FOREIGN KEY ("leftPlayerId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FriendRequest" ADD CONSTRAINT "FriendRequest_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FriendRequest" ADD CONSTRAINT "FriendRequest_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChannelMembers" ADD CONSTRAINT "_ChannelMembers_A_fkey" FOREIGN KEY ("A") REFERENCES "Channel"("chanId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChannelMembers" ADD CONSTRAINT "_ChannelMembers_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BannedUsers" ADD CONSTRAINT "_BannedUsers_A_fkey" FOREIGN KEY ("A") REFERENCES "Channel"("chanId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BannedUsers" ADD CONSTRAINT "_BannedUsers_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChannelAdministrators" ADD CONSTRAINT "_ChannelAdministrators_A_fkey" FOREIGN KEY ("A") REFERENCES "Channel"("chanId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChannelAdministrators" ADD CONSTRAINT "_ChannelAdministrators_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChannelInvites" ADD CONSTRAINT "_ChannelInvites_A_fkey" FOREIGN KEY ("A") REFERENCES "Channel"("chanId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChannelInvites" ADD CONSTRAINT "_ChannelInvites_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MutedUsers" ADD CONSTRAINT "_MutedUsers_A_fkey" FOREIGN KEY ("A") REFERENCES "Channel"("chanId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MutedUsers" ADD CONSTRAINT "_MutedUsers_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AchievementsToUser" ADD CONSTRAINT "_AchievementsToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Achievements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AchievementsToUser" ADD CONSTRAINT "_AchievementsToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
