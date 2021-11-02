import * as React from 'react'

import { Octicon } from '../octicons'
import classNames from 'classnames'
import * as OcticonSymbol from '../octicons/octicons.generated'
import {
  getClassNameForLogStep,
  getSymbolForLogStep,
} from '../branches/ci-status'
import {
  getFormattedCheckRunDuration,
  IRefCheckOutput,
  RefCheckOutputType,
} from '../../lib/ci-checks/ci-checks'

interface ICICheckRunActionLogsProps {
  /** The check run to display **/
  readonly output: IRefCheckOutput

  /** Whether call for actions logs is pending */
  readonly loadingLogs: boolean
}

interface ICICheckRunActionLogsState {
  readonly openSections: ReadonlySet<number>
}

export class CICheckRunActionLogs extends React.PureComponent<
  ICICheckRunActionLogsProps,
  ICICheckRunActionLogsState
> {
  public constructor(props: ICICheckRunActionLogsProps) {
    super(props)
    this.state = {
      openSections: new Set<number>(),
    }
  }

  public toggleOpenState = (index: number) => {
    return () => {
      const openSections = new Set(this.state.openSections)
      if (openSections.has(index)) {
        openSections.delete(index)
      } else {
        openSections.add(index)
      }

      this.setState({ openSections })
    }
  }

  public render() {
    const { output, loadingLogs } = this.props

    if (loadingLogs) {
      return <>Loading…</>
    }

    if (output.type !== RefCheckOutputType.Actions) {
      // This shouldn't happen, should only be provided actions type
      return <>Unable to load logs.</>
    }

    return output.steps.map((step, i) => {
      const isSkipped = step.conclusion === 'skipped'
      const showLogs = this.state.openSections.has(i) && !isSkipped

      const header = (
        <div className="ci-check-run-log-step-header-container">
          {!isSkipped ? (
            <Octicon
              className="log-step-toggled-indicator"
              symbol={
                showLogs
                  ? OcticonSymbol.chevronDown
                  : OcticonSymbol.chevronRight
              }
              title={step.name}
            />
          ) : (
            <span className="no-toggle"></span>
          )}

          <Octicon
            className={classNames(
              'log-step-status',
              `ci-status-${getClassNameForLogStep(step)}`
            )}
            symbol={getSymbolForLogStep(step)}
            title={step.name}
          />
          <div className="ci-check-run-log-step-name">{step.name}</div>
          <div>{getFormattedCheckRunDuration(step)}</div>
        </div>
      )

      const headerClassNames = classNames('ci-check-run-log-step-header', {
        open: showLogs,
      })

      return (
        <div
          className="ci-check-run-log-step"
          key={i}
          onClick={this.toggleOpenState(i)}
        >
          <div className={headerClassNames}>{header}</div>
          {showLogs ? (
            <div className="ci-check-run-step-log-display">{step.log}</div>
          ) : null}
        </div>
      )
    })
  }
}