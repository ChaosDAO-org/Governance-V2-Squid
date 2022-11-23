import assert from 'assert'
import {Chain, ChainContext, EventContext, Event, Result, Option} from './support'
import * as v103 from './v103'

export class ReferendaSubmittedEvent {
  private readonly _chain: Chain
  private readonly event: Event

  constructor(ctx: EventContext)
  constructor(ctx: ChainContext, event: Event)
  constructor(ctx: EventContext, event?: Event) {
    event = event || ctx.event
    assert(event.name === 'Referenda.Submitted')
    this._chain = ctx._chain
    this.event = event
  }

  /**
   * A referendum has being submitted.
   */
  get isV103(): boolean {
    return this._chain.getEventHash('Referenda.Submitted') === 'dd1db40cab9e2e0c54e203f9c60347029a08160d5930b550604e5378d4c502df'
  }

  /**
   * A referendum has being submitted.
   */
  get asV103(): {index: number, track: number, proposal: v103.Bounded} {
    assert(this.isV103)
    return this._chain.decodeEvent(this.event)
  }
}
