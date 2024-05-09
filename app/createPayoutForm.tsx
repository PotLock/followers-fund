import { Select, SelectItem, Avatar, Chip, User, Image, Divider, Input, Button, user } from "@nextui-org/react";
import { Card, CardHeader, CardBody, CardFooter } from "@nextui-org/card";
import { useOptimistic, useRef, useState, useTransition, useEffect, use } from "react";

import { v4 as uuidv4 } from "uuid";
type Props = {
    fid: string;
}
export const fundType = [
    { label: "Amount of followers", value: "followers", description: "Amount of followers" },
];
export const tokenType = [
    { label: "Eth", value: "eth", description: "Ethereum" },
    { label: "Token", value: "token", description: "Token" },
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
    const [filterUserFollow, setFilterUserFollow] = useState([]);
    const [filterData, setFilterData] = useState([]);
    const [totalAmount, setTotalAmount] = useState("0");
    const [totalFollower, setTotalFollower] = useState(0);
    const [tokenAddress, setTokenAddress] = useState("");
    
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
        console.log(e.target.value)
        setSelectType(e.target.value)
    }
    const handleSelectionChangeSelecToken = async (e: any) => {
        console.log(e.target.value)
        setSelectToken(e.target.value)
    }

    const handleSelectionChange = async (e: any) => {
        const users = e.target.value.split(",");
        let countTotalFollower = 0;
        if (users[0] !== '') {
            const usersSelected: any = [];
            const dataUsersFollow: any = [];
            for (const user of users) {
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
            setTotalFollower(countTotalFollower)
            setSelectUsers(usersSelected);

            const idMap = new Map();
            const filteredData = dataUsersFollow.filter((item: any) => {
                if (!idMap.has(item.fid)) {
                    idMap.set(item.fid, true);
                    return true;
                }
                return false;
            });
            setFilterUserFollow(filteredData)
        } else {
            setFilterUserFollow([])
        }

    };
    const createPayoutButton = async() =>{
        let userObj :any= {}
        let usersArr = []
        const userData : any = selectUsers
        for (const user of userData) {
            userObj = {
                fid : user.fid,
                pfp : user.pfp,
                username:user.username,
                matched:removeCommonElements(user.follower , filterData).length,
                allocations :(parseInt(totalAmount) * (removeCommonElements(user.follower, filterData).length / (totalFollower - (user.follower.length - removeCommonElements(user.follower, filterData).length)))).toFixed(2) || 0
            }
            usersArr.push(userObj)

        }
        const payout : any = {
            user:usersArr,
            id: uuidv4(),
            type:selectType,
            amount:totalAmount,
            network:'',
            token:selectToken,
            tokenAddress:tokenAddress,
            created_at: new Date().getTime(),
        }
        const response = await fetch('/create-payout', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payout), // Replace with your actual data
          });
      
          const data = await response.json();
          console.log("data",data);
    }

    return (
        <>
            <div>
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
            </div>
            <div>
                <Select
                    variant="bordered"
                    label="Select Type"
                    className="max-w-xs"
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
            </div>

            {selectType == "followers" && (
                <>
                    <div>
                        <Select
                            items={filterUserFollow}
                            label="Filter User Flow"
                            isMultiline={true}
                            selectionMode="multiple"
                            placeholder="Select user"
                            variant="bordered"
                            isRequired
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
                    </div>
                    <div>
                        <Select
                            variant="bordered"
                            label="Select Token"
                            className="max-w-xs"
                            onChange={handleSelectionChangeSelecToken}
                            isRequired
                        >
                            {tokenType.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                </SelectItem>
                            ))}
                        </Select>
                    </div>
                    {selectToken == "token" && (
                        <div>
                            <Input
                                label="Token Address"
                                value={tokenAddress}
                                onValueChange={setTokenAddress}
                                placeholder="0x0...."
                            />
                        </div>
                    )}

                    <div>
                        <Input
                            type="number"
                            label="Amount"
                            value={totalAmount}
                            onValueChange={setTotalAmount}
                            placeholder="0.00"
                        />
                    </div>
                    <div>
                        {selectUsers && selectUsers.map((user: any) =>
                            <>
                                <Card className="max-w-[400px]">
                                    <CardHeader className="flexjustify-between">
                                        <div className="flex gap-5">
                                            <Avatar isBordered radius="full" size="md" src={user.pfp} />
                                            <div className="flex flex-col gap-1 items-start justify-center">
                                                <h4 className="text-small font-semibold leading-none text-default-600">{user.username} - Matched : {removeCommonElements(user.follower, filterData).length} - Allocations : {(parseInt(totalAmount) * (removeCommonElements(user.follower, filterData).length / (totalFollower - (user.follower.length - removeCommonElements(user.follower, filterData).length)))).toFixed(2) || 0}</h4>
                                                <h5 className="text-small tracking-tight text-default-400">{user.custodyAddress}</h5>
                                            </div>

                                        </div>

                                    </CardHeader>
                                </Card>
                            </>
                        )}


                    </div>
                    <div>
                        <Button color="primary" onClick={createPayoutButton}>
                            Create
                        </Button>
                    </div>
                </>
            )}



        </>

    )
}