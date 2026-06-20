import { xf, once, print, exists, } from '../functions.js';
import { isoDate, } from '../utils.js';
import { OAuthService, DialogMsg, stateParam, } from './enums.js';
import { LocalStorageItem } from '../storage/local-storage.js';

function Intervals(args = {}) {
    const serviceName = OAuthService.intervals;
    const baseUrl = 'https://intervals.icu';

    const apiKeyStore = LocalStorageItem({key: 'intervals-api-key', fallback: ''});
    const athleteIdStore = LocalStorageItem({key: 'intervals-athlete-id', fallback: ''});

    function getCredentials() {
        const apiKey = apiKeyStore.get();
        const athleteId = athleteIdStore.get();
        return { apiKey, athleteId };
    }

    function isConnected() {
        const { apiKey, athleteId } = getCredentials();
        return apiKey !== '' && athleteId !== '';
    }

    function authHeaders() {
        const { apiKey } = getCredentials();
        return {
            'Authorization': 'Basic ' + btoa('API_KEY:' + apiKey),
        };
    }

    function athleteUrl(path) {
        const { athleteId } = getCredentials();
        return `${baseUrl}/api/v1/athlete/${athleteId}${path}`;
    }

    // "Connect" = save API key + athlete ID
    function connect(apiKey, athleteId) {
        if(apiKey && athleteId) {
            apiKeyStore.set(apiKey);
            athleteIdStore.set(athleteId);
            xf.dispatch(`services`, {intervals: true});
            console.log(`:intervals :connect :success`);
        }
    }

    function disconnect() {
        apiKeyStore.set('');
        athleteIdStore.set('');
        xf.dispatch(`services`, {intervals: false});
        console.log(`:intervals :disconnect`);
    }

    // No-op: OAuth params no longer needed
    async function paramsHandler(args = {}) {}

    function update() {}

    async function uploadWorkout(record) {
        if(!isConnected()) return ':fail';

        const blob = record.blob;
        const workoutName = record.summary?.name ?? 'Powered by Auuki workout';
        const url = athleteUrl('/activities') + '?' +
              new URLSearchParams({ name: workoutName }).toString();

        const formData = new FormData();
        formData.append('file', blob);

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: authHeaders(),
                body: formData,
            });

            if(response.ok) {
                return ':success';
            } else {
                if(response.status === 401 || response.status === 403) {
                    console.log(`:intervals :no-auth`);
                    xf.dispatch('ui:modal:error:open', DialogMsg.noAuth);
                }
                return ':fail';
            }
        } catch(error) {
            console.log(error);
            return ':fail';
        }
    }

    // GET /api/v1/athlete/{id}/events?oldest=...&newest=...
    async function wod(oldest = isoDate(), newest = isoDate()) {
        if(!isConnected()) {
            xf.dispatch('action:planned', ':intervals:wod:fail');
            return [];
        }

        const url = athleteUrl('/events') + '?' +
              new URLSearchParams({ oldest, newest, resolve: true }).toString();

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: authHeaders(),
            });

            if(response.ok) {
                const data = await response.json();
                xf.dispatch('action:planned', ':intervals:wod:success');
                console.log(data);
                return data.filter((item) => exists(item.workout_file_base64) || exists(item.workout_doc));
            } else {
                xf.dispatch('action:planned', ':intervals:wod:fail');
                if(response.status === 401 || response.status === 403) {
                    console.log(`:intervals :no-auth`);
                    xf.dispatch('ui:modal:error:open', DialogMsg.noAuth);
                }
                return [];
            }
        } catch(error) {
            xf.dispatch('action:planned', ':intervals:wod:fail');
            console.log(error);
            return [];
        }
    }

    async function wodMock(oldest = isoDate(), newest = isoDate()) {
        const body = [{
            id: 47549572,
            start_date_local: `2026-03-03T00:00:00`,
            category: "WORKOUT",
            name: "Intervals.icu Threshold",
            indoor: true,
            workout_filename: "Intervals_icu_Threshold.zwo",
            workout_file_base64: "PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9InllcyI/Pgo8d29ya291dF9maWxlPgogICAgPGF1dGhvcj5EaW1pdGFyIE1hcmlub3Y8L2F1dGhvcj4KICAgIDxuYW1lPkludGVydmFscy5pY3UgVGhyZXNob2xkPC9uYW1lPgogICAgPGRlc2NyaXB0aW9uPjwvZGVzY3JpcHRpb24+CiAgICA8c3BvcnRUeXBlPmJpa2U8L3Nwb3J0VHlwZT4KICAgIDx0YWdzLz4KICAgIDx3b3Jrb3V0PgogICAgICAgIDxXYXJtdXAgUG93ZXJIaWdoPSIwLjYyNyIgUG93ZXJMb3c9IjAuMzg5IiBEdXJhdGlvbj0iMzAwIi8+CiAgICAgICAgPFN0ZWFkeVN0YXRlIHNob3dfYXZnPSIxIiBQb3dlcj0iMC42MjciIER1cmF0aW9uPSI2MCIvPgogICAgICAgIDxTdGVhZHlTdGF0ZSBzaG93X2F2Zz0iMSIgUG93ZXI9IjAuOTc4IiBEdXJhdGlvbj0iMzAiLz4KICAgICAgICA8U3RlYWR5U3RhdGUgc2hvd19hdmc9IjEiIFBvd2VyPSIwLjUiIER1cmF0aW9uPSIzMCIvPgogICAgICAgIDxTdGVhZHlTdGF0ZSBzaG93X2F2Zz0iMSIgUG93ZXI9IjAuOTc4IiBEdXJhdGlvbj0iMzAiLz4KICAgICAgICA8U3RlYWR5U3RhdGUgc2hvd19hdmc9IjEiIFBvd2VyPSIwLjUiIER1cmF0aW9uPSIzMCIvPgogICAgICAgIDxTdGVhZHlTdGF0ZSBzaG93X2F2Zz0iMSIgUG93ZXI9IjAuNTU5IiBEdXJhdGlvbj0iMTIwIi8+CiAgICAgICAgPFN0ZWFkeVN0YXRlIHNob3dfYXZnPSIxIiBQb3dlcj0iMS4wIiBEdXJhdGlvbj0iMzAwIi8+CiAgICAgICAgPFN0ZWFkeVN0YXRlIHNob3dfYXZnPSIxIiBQb3dlcj0iMC41IiBEdXJhdGlvbj0iMzAwIi8+CiAgICAgICAgPFN0ZWFkeVN0YXRlIHNob3dfYXZnPSIxIiBQb3dlcj0iMS4wIiBEdXJhdGlvbj0iMzAwIi8+CiAgICAgICAgPFN0ZWFkeVN0YXRlIHNob3dfYXZnPSIxIiBQb3dlcj0iMC41IiBEdXJhdGlvbj0iMzAwIi8+CiAgICAgICAgPFN0ZWFkeVN0YXRlIHNob3dfYXZnPSIxIiBQb3dlcj0iMS4wIiBEdXJhdGlvbj0iMzAwIi8+CiAgICAgICAgPFN0ZWFkeVN0YXRlIHNob3dfYXZnPSIxIiBQb3dlcj0iMC41IiBEdXJhdGlvbj0iMzAwIi8+CiAgICAgICAgPFN0ZWFkeVN0YXRlIHNob3dfYXZnPSIxIiBQb3dlcj0iMS4wIiBEdXJhdGlvbj0iMzAwIi8+CiAgICAgICAgPFN0ZWFkeVN0YXRlIHNob3dfYXZnPSIxIiBQb3dlcj0iMC41IiBEdXJhdGlvbj0iMzAwIi8+CiAgICAgICAgPFN0ZWFkeVN0YXRlIHNob3dfYXZnPSIxIiBQb3dlcj0iMS4wIiBEdXJhdGlvbj0iMzAwIi8+CiAgICAgICAgPFN0ZWFkeVN0YXRlIHNob3dfYXZnPSIxIiBQb3dlcj0iMC41IiBEdXJhdGlvbj0iMzAwIi8+CiAgICAgICAgPENvb2xkb3duIFBvd2VySGlnaD0iMC4zODkiIFBvd2VyTG93PSIwLjUiIER1cmF0aW9uPSIzMDAiLz4KICAgIDwvd29ya291dD4KPC93b3Jrb3V0X2ZpbGU+Cg==" }
                      ,
{
            id: 47549573,
            start_date_local: `2026-03-04T00:00:00`,
            category: "WORKOUT",
            name: "Intervals.icu Threshold",
            indoor: true,
            workout_filename: "Intervals_icu_Threshold.zwo",
            workout_file_base64: "PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9InllcyI/Pgo8d29ya291dF9maWxlPgogICAgPGF1dGhvcj5EaW1pdGFyIE1hcmlub3Y8L2F1dGhvcj4KICAgIDxuYW1lPkludGVydmFscy5pY3UgVGhyZXNob2xkPC9uYW1lPgogICAgPGRlc2NyaXB0aW9uPjwvZGVzY3JpcHRpb24+CiAgICA8c3BvcnRUeXBlPmJpa2U8L3Nwb3J0VHlwZT4KICAgIDx0YWdzLz4KICAgIDx3b3Jrb3V0PgogICAgICAgIDxXYXJtdXAgUG93ZXJIaWdoPSIwLjYyNyIgUG93ZXJMb3c9IjAuMzg5IiBEdXJhdGlvbj0iMzAwIi8+CiAgICAgICAgPFN0ZWFkeVN0YXRlIHNob3dfYXZnPSIxIiBQb3dlcj0iMC42MjciIER1cmF0aW9uPSI2MCIvPgogICAgICAgIDxTdGVhZHlTdGF0ZSBzaG93X2F2Zz0iMSIgUG93ZXI9IjAuOTc4IiBEdXJhdGlvbj0iMzAiLz4KICAgICAgICA8U3RlYWR5U3RhdGUgc2hvd19hdmc9IjEiIFBvd2VyPSIwLjUiIER1cmF0aW9uPSIzMCIvPgogICAgICAgIDxTdGVhZHlTdGF0ZSBzaG93X2F2Zz0iMSIgUG93ZXI9IjAuOTc4IiBEdXJhdGlvbj0iMzAiLz4KICAgICAgICA8U3RlYWR5U3RhdGUgc2hvd19hdmc9IjEiIFBvd2VyPSIwLjUiIER1cmF0aW9uPSIzMCIvPgogICAgICAgIDxTdGVhZHlTdGF0ZSBzaG93X2F2Zz0iMSIgUG93ZXI9IjAuNTU5IiBEdXJhdGlvbj0iMTIwIi8+CiAgICAgICAgPFN0ZWFkeVN0YXRlIHNob3dfYXZnPSIxIiBQb3dlcj0iMS4wIiBEdXJhdGlvbj0iMzAwIi8+CiAgICAgICAgPFN0ZWFkeVN0YXRlIHNob3dfYXZnPSIxIiBQb3dlcj0iMC41IiBEdXJhdGlvbj0iMzAwIi8+CiAgICAgICAgPFN0ZWFkeVN0YXRlIHNob3dfYXZnPSIxIiBQb3dlcj0iMS4wIiBEdXJhdGlvbj0iMzAwIi8+CiAgICAgICAgPFN0ZWFkeVN0YXRlIHNob3dfYXZnPSIxIiBQb3dlcj0iMC41IiBEdXJhdGlvbj0iMzAwIi8+CiAgICAgICAgPFN0ZWFkeVN0YXRlIHNob3dfYXZnPSIxIiBQb3dlcj0iMS4wIiBEdXJhdGlvbj0iMzAwIi8+CiAgICAgICAgPFN0ZWFkeVN0YXRlIHNob3dfYXZnPSIxIiBQb3dlcj0iMC41IiBEdXJhdGlvbj0iMzAwIi8+CiAgICAgICAgPFN0ZWFkeVN0YXRlIHNob3dfYXZnPSIxIiBQb3dlcj0iMS4wIiBEdXJhdGlvbj0iMzAwIi8+CiAgICAgICAgPFN0ZWFkeVN0YXRlIHNob3dfYXZnPSIxIiBQb3dlcj0iMC41IiBEdXJhdGlvbj0iMzAwIi8+CiAgICAgICAgPFN0ZWFkeVN0YXRlIHNob3dfYXZnPSIxIiBQb3dlcj0iMS4wIiBEdXJhdGlvbj0iMzAwIi8+CiAgICAgICAgPFN0ZWFkeVN0YXRlIHNob3dfYXZnPSIxIiBQb3dlcj0iMC41IiBEdXJhdGlvbj0iMzAwIi8+CiAgICAgICAgPENvb2xkb3duIFBvd2VySGlnaD0iMC4zODkiIFBvd2VyTG93PSIwLjUiIER1cmF0aW9uPSIzMDAiLz4KICAgIDwvd29ya291dD4KPC93b3Jrb3V0X2ZpbGU+Cg==" }
        ];

        return body;
    }

    function athleteToSettings(athlete = {}, defaults = {weight: 0, ftp: 0}) {
        const sportSettings = athlete.sportSettings ?? [];
        const weight = athlete.weight ?? athlete.icu_weight ?? defaults.weight;
        let ftp = defaults.ftp;

        let rideSetting;
        let virtualRideSetting;

        for(let sportSetting of sportSettings) {
            const types = sportSetting.types;

            for(let type of types) {
                if(type === "VirtualRide") {
                    virtualRideSetting = sportSetting;
                }
                if(type === "Ride") {
                    rideSetting = sportSetting;
                }
            }
        }

        if(virtualRideSetting) {
            ftp = virtualRideSetting.indoor_ftp ?? virtualRideSetting.ftp ?? defaults.ftp;
            return {weight, ftp};
        }
        if(rideSetting) {
            ftp = rideSetting.indoor_ftp ?? rideSetting.ftp ?? 0;
            return {weight, ftp};
        }

        return {weight, ftp};
    }

    // GET /api/v1/athlete/{id}
    async function getAthlete() {
        if(!isConnected()) {
            xf.dispatch('action:athlete', ':intervals:athlete:fail');
            return athleteToSettings();
        }

        const url = athleteUrl('');

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: authHeaders(),
            });

            if(response.ok) {
                const data = await response.json();
                xf.dispatch('action:athlete', ':intervals:athlete:success');
                console.log(data);
                return athleteToSettings(data);
            } else {
                xf.dispatch('action:athlete', ':intervals:athlete:fail');
                if(response.status === 401 || response.status === 403) {
                    console.log(`:intervals :no-auth`);
                    xf.dispatch('ui:modal:error:open', DialogMsg.noAuth);
                }
                return athleteToSettings();
            }
        } catch(error) {
            xf.dispatch('action:athlete', ':intervals:athlete:fail');
            console.log(error);
            return athleteToSettings();
        }
    }

    return Object.freeze({
        connect,
        disconnect,
        paramsHandler,
        uploadWorkout,
        update,
        wod,
        getAthlete,
        athleteToSettings,
        isConnected,

        wodMock,
    });
}

const intervals = Intervals();

export default intervals;
