// Standalone, Blockly-free reimplementation of the subset of
// bot-skeleton/services/tradeEngine/utils/helpers.js that api-base.ts needs
// (doUntilDone, socket_state). The original getBackoffDelayInMs reads
// window.Blockly.derivWorkspace to log the selected trade-type category —
// that's bot-workspace-specific telemetry, dropped here since there's no
// Blockly workspace in the standalone charts app. Retry/backoff behavior
// itself (exponential backoff, ignorable-error list) is preserved as-is.

import { observer as globalObserver } from '../../../utils/observer';

export const findValueByKeyRecursively = (obj: any, key: string): any => {
    let return_value;

    Object.keys(obj).some(obj_key => {
        const value = obj[obj_key];

        if (obj_key === key) {
            return_value = obj[key];
            return true;
        }

        if (typeof value === 'object' && value !== null) {
            const nested_value = findValueByKeyRecursively(value, key);
            if (nested_value) {
                return_value = nested_value;
                return true;
            }
        }
        return false;
    });

    return return_value;
};

const getBackoffDelayInMs = (error_obj: any) => {
    // Simplified from the original: same exponential backoff math, minus the
    // Blockly-workspace trade-type lookup used only for console logging.
    return (delay_index: number) => {
        const base_delay = 2.5;
        const max_delay = 15;
        const next_delay_in_seconds = Math.min(base_delay * delay_index, max_delay);
        return next_delay_in_seconds * 1000;
    };
};

export const shouldThrowError = (error: any, errors_to_ignore: string[] = []) => {
    if (!error?.error) return false;

    const default_errors_to_ignore = [
        'CallError',
        'WrongResponse',
        'GetProposalFailure',
        'RateLimit',
        'DisconnectError',
        'MarketIsClosed',
    ];

    const is_ignorable_error = errors_to_ignore
        .concat(default_errors_to_ignore)
        .includes(error?.error?.code ?? error?.name);

    return !is_ignorable_error;
};

export const recoverFromError = (
    promiseFn: () => Promise<any> | undefined,
    recoverFn: (error_code: string, makeDelay: () => Promise<void>) => void,
    errors_to_ignore: string[],
    delay_index: number,
    api_base?: { is_running?: boolean }
): Promise<any> => {
    return new Promise((resolve, reject) => {
        const promise = promiseFn();

        if (promise) {
            promise.then(resolve).catch(error => {
                if (shouldThrowError(error, errors_to_ignore) || (api_base && !api_base.is_running)) {
                    if (error?.error?.code === 'OpenPositionLimitExceeded') {
                        setTimeout(() => {
                            globalObserver.emit('bot.stop_button_click');
                        }, 500);
                    }
                    reject(error);
                    return;
                }

                recoverFn(
                    error?.error?.code ?? error?.name,
                    () =>
                        new Promise(recoverResolve => {
                            const getGlobalTimeouts = () => globalObserver.getState('global_timeouts') ?? [];

                            const timeout = setTimeout(
                                () => {
                                    const global_timeouts = getGlobalTimeouts();
                                    delete global_timeouts[timeout as unknown as number];
                                    globalObserver.setState(global_timeouts);
                                    recoverResolve();
                                },
                                getBackoffDelayInMs(error)(delay_index)
                            );

                            const global_timeouts = getGlobalTimeouts();
                            const cancellable_timeouts = ['buy'];
                            const msg_type = findValueByKeyRecursively(error, 'msg_type');

                            global_timeouts[timeout as unknown as number] = {
                                is_cancellable: cancellable_timeouts.includes(msg_type),
                                msg_type,
                            };

                            globalObserver.setState({ global_timeouts });
                        })
                );
            });
        } else {
            resolve(undefined);
        }
    });
};

export const doUntilDone = (promiseFn: () => Promise<any> | undefined, errors_to_ignore: string[], api_base?: any) => {
    let delay_index = 1;

    return new Promise((resolve, reject) => {
        const recoverFn = (_error_code: string, makeDelay: () => Promise<void>) => {
            delay_index++;
            makeDelay().then(repeatFn);
        };

        const repeatFn = () => {
            recoverFromError(promiseFn, recoverFn, errors_to_ignore, delay_index, api_base).then(resolve).catch(reject);
        };

        repeatFn();
    });
};

export const socket_state = {
    [WebSocket.CONNECTING]: 'Connecting',
    [WebSocket.OPEN]: 'Connected',
    [WebSocket.CLOSING]: 'Closing',
    [WebSocket.CLOSED]: 'Closed',
};
