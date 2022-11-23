import { lookupArchive } from "@subsquid/archive-registry"
import * as ss58 from "@subsquid/ss58"
import { BatchContext, BatchProcessorItem, SubstrateBatchProcessor } from "@subsquid/substrate-processor"
import { Store, TypeormDatabase } from "@subsquid/typeorm-store"
import { In } from "typeorm"
import { Account, ReferendumStatus, Referenda } from "./model"
import { ReferendaSubmittedEvent } from "./types/events"
import * as v103 from './types/v103'


const processor = new SubstrateBatchProcessor()
    .setDataSource({
        // Lookup archive by the network name in the Subsquid registry
        // archive: lookupArchive("kusama", { release: "FireSquid" })

        // Use archive created by archive/docker-compose.yml
        archive: 'http://localhost:8888/graphql'
    })
    .addEvent('Referenda.Submitted', {
        data: {
            event: {
                args: true,
                extrinsic: {
                    hash: true,
                    fee: true
                }
            }
        }
    } as const)


type Item = BatchProcessorItem<typeof processor>
type Ctx = BatchContext<Store, Item>


processor.run(new TypeormDatabase(), async ctx => {
    let referendaData = getReferenda(ctx);
    let referenda: Referenda[] = []

    referendaData.forEach((ref) => {
        referenda.push(new Referenda({
            id: ref.id,
            track: ref.track,
            status: ref.status
        }));
    });

    console.log(referendaData);
    await ctx.store.save(referenda);

    // let accountIds = new Set<string>()
    // for (let t of transfersData) {
    //     accountIds.add(t.from)
    //     accountIds.add(t.to)
    // }

    // let accounts = await ctx.store.findBy(Account, { id: In([...accountIds]) }).then(accounts => {
    //     return new Map(accounts.map(a => [a.id, a]))
    // })

    // let transfers: Transfer[] = []

    // for (let t of transfersData) {
    //     let { id, blockNumber, timestamp, extrinsicHash, amount, fee } = t

    //     let from = getAccount(accounts, t.from)
    //     let to = getAccount(accounts, t.to)

    //     transfers.push(new Transfer({
    //         id,
    //         blockNumber,
    //         timestamp,
    //         extrinsicHash,
    //         from,
    //         to,
    //         amount,
    //         fee
    //     }))
    // }

    // await ctx.store.save(Array.from(accounts.values()))
    // await ctx.store.insert(transfers)
})


// interface TransferEvent {
//     id: string
//     blockNumber: number
//     timestamp: Date
//     extrinsicHash?: string
//     from: string
//     to: string
//     amount: bigint
//     fee?: bigint
// }

interface ReferendaEvents {
    id: string
    track: number
    status: ReferendumStatus
}

function getReferenda(ctx: Ctx): ReferendaEvents[] {
    let referenda: ReferendaEvents[] = []
    for (let block of ctx.blocks) {
        for (let item of block.items) {
            if (item.name == "Referenda.Submitted") {
                let e = new ReferendaSubmittedEvent(ctx, item.event)
                let rec: { index: string, track: number, proposal: v103.Bounded }
                let index = e.asV103.index.toString();
                let track = e.asV103.track;
                let proposal = e.asV103.proposal;
                rec = { index, track, proposal };
                console.log(e.asV103);
                // rec = { fields.index, fields.track, fields.proposal };
                referenda.push({
                    id: rec.index,
                    track: rec.track,
                    status: ReferendumStatus.ONGOING
                    // blockNumber: block.header.height,
                });
            }
        }
    }
    return referenda;
}


function getAccount(m: Map<string, Account>, id: string): Account {
    let acc = m.get(id)
    if (acc == null) {
        acc = new Account()
        acc.id = id
        m.set(id, acc)
    }
    return acc
}
