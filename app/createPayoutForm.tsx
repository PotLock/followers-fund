import { Select, SelectItem, Avatar, Chip, User, Image, Divider, Input, Button, useDisclosure, user, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@nextui-org/react";
import { Card, CardHeader, CardBody, CardFooter } from "@nextui-org/card";
import { useOptimistic, useRef, useState, useTransition, useEffect, useMemo } from "react";
import { useRouter } from 'next/navigation';

import { v4 as uuidv4 } from "uuid";
type Props = {
    fid: string;
}
export const fundType = [
    { label: "Amount of followers", value: "followers", description: "Amount of followers" },
];
export const tokenType = [
    { label: "Ethereum", value: "ethereum", description: "Ethereum" },
    { label: "Address Token", value: "token", description: "Token" },

];

export const network = [
    { label: "Ethereum", value: "1", description: "Ethereum" },
    { label: "Sepolia", value: "11155111", description: "sepolia" },
    { label: "Base", value: "8453", description: "Base" },
    { label: "Base Sepolia", value: "84532", description: "basesepolia" },
];

function removeCommonElements(a: any, b: any) {
    const bIds = new Set(b.map((item: any) => item.fid));
    return a.filter((itemA: any) => !bIds.has(itemA.fid));
}

export function PayoutCreateForm1({ fid }: Props) {
    useEffect(() => {
        fetch(`/api/userflow?fid=${fid}`)
            .then((res) => {
                return res.json();
            })
            .then((data) => {
                setUserFollow(data.result);
            });
    }, []);

    const [userFollow, setUserFollow] = useState([]);
    const [selectUsers, setSelectUsers] = useState([]);
    const [selectType, setSelectType] = useState("");
    const [selectToken, setSelectToken] = useState("");
    const [selectNetwork, setSelectNetwork] = useState("1");
    const [filterUserFollow, setFilterUserFollow] = useState([]);
    const [filterData, setFilterData] = useState([]);
    const [totalAmount, setTotalAmount] = useState("0");
    const [totalFollower, setTotalFollower] = useState(0);
    const [tokenAddress, setTokenAddress] = useState("");
    const [title, setTitle] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter()
    
    const handleSelectionChangeFilter = async (e: any) => {
        const users = e.target.value.split(",");
        if (users[0] !== '') {
            const usersSelected: any = [];
            for (const user of users) {
                const userData = user.split("|")
                const userObject = {
                    fid: parseInt(userData[0]),
                    username: userData[1],
                    custodyAddress: userData[2],
                    pfp: userData[3],
                }
                usersSelected.push(userObject)
            }
            setFilterData(usersSelected);
        } else {
            setFilterData([]);
        }
    }
    const handleSelectionType = async (e: any) => {
        setSelectType(e.target.value)
    }
    const handleSelectionChangeSelectNetwork = async (e: any) => {
        setSelectNetwork(e.target.value)
    }
    const handleSelectionChangeSelectToken = async (e: any) => {
        setSelectToken(e.target.value)
    }

    const handleSelectionChange = async (e: any) => {
        const users = e.target.value.split(",");
        
        let countTotalFollower = 0;
        const usersSelected: any = [];
        const dataUsersFollow: any = [];
        for (const user of users) {
            if (user !== '') {
                const res = await fetch(`/api/userflow?fid=${user.split("|")[0]}`)
                const data = await res.json()

                data.result.map((item: any) => {
                    dataUsersFollow.push(item)
                })
                const userData = user.split("|")

                const userObject = {
                    fid: parseInt(userData[0]),
                    username: userData[1],
                    custodyAddress: userData[2],
                    pfp: userData[3],
                    follower: data.result
                }
                countTotalFollower += data.result.length;

                usersSelected.push(userObject)
            }

        }
       

        const idMap = new Map();
        const filteredData = dataUsersFollow.filter((item: any) => {
            if (!idMap.has(item.fid)) {
                idMap.set(item.fid, true);
                return true;
            }
            return false;
        });
        console.log("filteredData",filteredData,selectUsers)
        setFilterUserFollow(filteredData)
        setTotalFollower(countTotalFollower)
        setSelectUsers(usersSelected)
    };

    const createPayoutButton = async () => {
        setIsLoading(true)
        let userObj: any = {}
        let usersArr = []
        const userData: any = selectUsers
        for (const user of userData) {
            userObj = {
                fid: user.fid,
                pfp: user.pfp,
                custodyAddress: user.custodyAddress,
                username: user.username,
                matched: removeCommonElements(user.follower, filterData).length,
                network: parseInt(selectNetwork),
                tokenAddress: tokenAddress,
                allocations: (parseFloat(totalAmount) * (removeCommonElements(user.follower, filterData).length / (totalFollower - (user.follower.length - removeCommonElements(user.follower, filterData).length)))).toFixed(6)
            }
            usersArr.push(userObj)

        }
        const resUser = await fetch(`/api/current-user?fid=${fid}`)
        const user = await resUser.json();
        const payout: any = {
            title: title,
            user: usersArr,
            id: uuidv4(),
            type: selectType,
            amount: totalAmount,
            network: parseInt(selectNetwork),
            token: selectToken,
            tokenAddress: tokenAddress,
            user_created: user,
            created_at: new Date().getTime(),
            payout_status: false,
        }
        const response = await fetch('/api/create-payout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payout), // Replace with your actual data
        });

        const data = await response.json();
        if (data.status == "succesful") {
            router.push(`/payouts/${payout.id}`)

        }
        // Check data before creat payout
        setIsLoading(false)
    }
    const isInvalid = useMemo(() => {
        if (totalAmount === "") return false;
        return parseFloat(totalAmount) > 0.000001 ? false : true;
    }, [totalAmount]);
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    return (
        <>
            <div className="py-2 grid justify-items-end">
                <Button onPress={onOpen} color="primary">Create Payout</Button>
            </div>
            <Modal
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                placement="top-center"
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">Create Payout</ModalHeader>
                            <ModalBody>
                                <Input
                                    label="Title"
                                    value={title}
                                    onValueChange={setTitle}
                                    placeholder="Input title"
                                    variant="bordered"
                                />
                                <Select
                                    items={userFollow}
                                    label="Fund to"
                                    isMultiline={true}
                                    selectionMode="multiple"
                                    placeholder="Select user"
                                    variant="bordered"
                                    isRequired
                                    onChange={handleSelectionChange}
                                    renderValue={(items) => {
                                        return (
                                            <div className="flex flex-wrap gap-2">
                                                {items.map((item) => (
                                                    <Chip
                                                        avatar={
                                                            <Avatar
                                                                src={item.data.pfp.url}
                                                            />
                                                        }
                                                        key={item.key}>{item.data.username}</Chip>
                                                ))}
                                            </div>
                                        );
                                    }}
                                >
                                    {(user: any) => (
                                        <SelectItem key={`${user.fid}|${user.username}|${user.custodyAddress}|${user.pfp.url}`} textValue={`${user.fid}-${user.username}-${user.custodyAddress}-${user.pfp.ur}`}>
                                            <div className="flex gap-2 items-center">
                                                <Avatar alt={user.username} className="flex-shrink-0" size="sm" src={user.pfp.url} />
                                                <div className="flex flex-col">
                                                    <span className="text-small">{user.username}</span>
                                                    <span className="text-tiny text-default-400">{user.custodyAddress}</span>
                                                </div>
                                            </div>
                                        </SelectItem>
                                    )}
                                </Select>
                                <Select
                                    variant="bordered"
                                    label="Select Type"
                                    isRequired
                                    onChange={handleSelectionType}
                                    defaultSelectedKeys={"eth"}
                                >
                                    {fundType.map((type) => (
                                        <SelectItem key={type.value} value={type.value}>
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </Select>
                                {selectType == "followers" && (
                                    <>
                                        <Select
                                            items={filterUserFollow}
                                            label="Filter User Flow"
                                            isMultiline={true}
                                            selectionMode="multiple"
                                            placeholder="Select user"
                                            variant="bordered"
                                            onChange={handleSelectionChangeFilter}
                                            renderValue={(items) => {
                                                return (
                                                    <div className="flex flex-wrap gap-2">
                                                        {items.map((item) => (
                                                            <Chip
                                                                avatar={
                                                                    <Avatar
                                                                        src={item.data.pfp.url}
                                                                    />
                                                                }
                                                                key={item.key}>{item.data.username}</Chip>
                                                        ))}
                                                    </div>
                                                );
                                            }}
                                        >
                                            {(user: any) => (
                                                <SelectItem key={`${user.fid}|${user.username}|${user.custodyAddress}|${user.pfp.url}`} textValue={`${user.fid}-${user.username}-${user.custodyAddress}-${user.pfp.ur}`}>
                                                    <div className="flex gap-2 items-center">
                                                        <Avatar alt={user.username} className="flex-shrink-0" size="sm" src={user.pfp.url} />
                                                        <div className="flex flex-col">
                                                            <span className="text-small">{user.username}</span>
                                                            <span className="text-tiny text-default-400">{user.custodyAddress}</span>
                                                        </div>
                                                    </div>
                                                </SelectItem>
                                            )}
                                        </Select>
                                        <Select
                                            variant="bordered"
                                            label="Select Network"
                                            className=""
                                            onChange={handleSelectionChangeSelectNetwork}
                                            isRequired
                                        >
                                            {network.map((type) => (
                                                <SelectItem key={type.value} value={type.value}>
                                                    {type.label}
                                                </SelectItem>
                                            ))}
                                        </Select>
                                        <Select
                                            variant="bordered"
                                            label="Select Token"
                                            className=""
                                            onChange={handleSelectionChangeSelectToken}
                                            isRequired
                                        >
                                            {tokenType.map((type) => (
                                                <SelectItem key={type.value} value={type.value}>
                                                    {type.label}
                                                </SelectItem>
                                            ))}
                                        </Select>
                                        {selectToken == "token" && (
                                            <Input
                                                label="Token Address"
                                                value={tokenAddress}
                                                onValueChange={setTokenAddress}
                                                placeholder="0x0...."
                                                variant="bordered"
                                            />
                                        )}
                                        <Input
                                            isInvalid={isInvalid}
                                            color={isInvalid ? "danger" : "success"}
                                            type="number"
                                            label="Amount"
                                            value={totalAmount}
                                            onValueChange={setTotalAmount}
                                            placeholder="0.00"
                                            variant="bordered"
                                        />
                                        {selectUsers && selectUsers.map((user: any) =>
                                            <Card className="max-w-[400px]">
                                                <CardHeader className="flexjustify-between">
                                                    <div className="flex gap-5">
                                                        <Avatar isBordered radius="full" size="md" src={user.pfp} />
                                                        <div className="flex flex-col gap-1 items-start justify-center">
                                                            <h4 className="text-small font-semibold leading-none text-default-600">{user.username} - Matched : {removeCommonElements(user.follower, filterData).length} - Allocations : {(parseFloat(totalAmount) * (removeCommonElements(user.follower, filterData).length / (totalFollower - (user.follower.length - removeCommonElements(user.follower, filterData).length)))).toFixed(6) || 0}</h4>
                                                            <h5 className="text-small tracking-tight text-default-400">{user.custodyAddress}</h5>
                                                        </div>
                                                    </div>
                                                </CardHeader>
                                            </Card>
                                        )}
                                    </>
                                )}
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="flat" onPress={onClose}>
                                    Close
                                </Button>
                                <Button
                                    color="primary"
                                    isLoading={isLoading}
                                    isDisabled={selectUsers.length == 0 || selectType == "" || selectNetwork == '0' || selectToken == "" || parseFloat(totalAmount) < 0.000001}
                                    spinner={
                                        <svg
                                            className="animate-spin h-5 w-5 text-current"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            />
                                            <path
                                                className="opacity-75"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                fill="currentColor"
                                            />
                                        </svg>
                                    }
                                    onPress={createPayoutButton}
                                >
                                    Create
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>

    )
}