import { object_without_properties } from 'svelte/internal';
import { writable } from 'svelte/store';

interface NewAlarmParams {
	wakeupTimeSeconds: number | null;
	poolPenatlyBps: number | null;
}

function createAlarmStore() {
	const alarm = writable<NewAlarmParams>({
		wakeupTimeSeconds: null,
		poolPenatlyBps: null
	});

	return {
		subscribe: alarm.subscribe,
		setWakeupTime: (hr: number, min: number, second: number) => {
			alarm.update((alarm: NewAlarmParams) => {
                const wakeupTimeSeconds = hr * 60 * 60 + min * 60 + second;
				return { ...alarm, wakeupTimeSeconds };
			});
		},
		setPercentFee: (percFee: number) => {
			alarm.update((alarm: NewAlarmParams) => {
				return { ...alarm, poolPenatlyBps: percFee * 100 };
			});
		}
	};
}

export const alarmParams = createAlarmStore();
