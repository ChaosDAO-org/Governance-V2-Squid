import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_} from "typeorm"
import {ReferendumStatus} from "./_referendumStatus"

@Entity_()
export class Referenda {
  constructor(props?: Partial<Referenda>) {
    Object.assign(this, props)
  }

  @PrimaryColumn_()
  id!: string

  @Column_("varchar", {length: 9, nullable: true})
  status!: ReferendumStatus | undefined | null
}
