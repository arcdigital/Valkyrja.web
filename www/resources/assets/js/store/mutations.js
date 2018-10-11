import "./mutation_types";
import {createGuild} from "../models/Guild";
import lscache from "lscache";
import {ADD_ARRAY_OBJECT, ADD_CONFIG, ADD_GUILDS, ADD_USER, CHANGE_CONFIG, INITIALIZE_USER} from "./mutation_types";
import {Config} from "../models/Config";
import {ConfigData} from "../models/ConfigData";

export const state = {
    /** @member {Array<Guild>} **/
    guilds: [],
    /** @member {Guild} **/
    guild: {},
    /** @member {Config} **/
    config: {},
    user: {
        name: null,
        avatar: null
    }
};

export const mutations = {
    [ADD_GUILDS](state, guilds) {
        let formattedGuilds = [];
        for (const guild of guilds) {
            formattedGuilds.push(createGuild(guild));
        }
        state.guilds = formattedGuilds;
    },

    [ADD_CONFIG](state, configData) {
        const {guild, config} = configData;
        log.debug("Creating Guild model and adding to store");
        state.guild = createGuild(guild, true);
        log.debug("Adding config data");
        state.config = Config.instanceFromApi(config);
        state.config.addGuildData(state.guild);
    },

    [ADD_USER](state, user) {
        log.debug("Adding user");
        state.user = user;
    },

    [INITIALIZE_USER](state) {
        log.debug("Initializing user from cache");
        if (lscache.get("user")) {
            log.debug("Found user from cache, setting state");
            state.user = JSON.parse(lscache.get("user"));
        }
    },

    [CHANGE_CONFIG](state, configData) {
        let conf = state.config.find(configData.storeName);
        if (conf instanceof ConfigData) {
            Vue.set(conf, "value", configData.value);
        }
    },

    [ADD_ARRAY_OBJECT](state, payload) {
        let array = state.config.find(payload.id);

        if (array instanceof ConfigData && array.value instanceof Array) {
            array.value.push(payload.value);
        }
        else if (payload.value instanceof ConfigData) {
            Vue.set(state.config.config_data, payload.id, ConfigData.newInstance(payload.id, [payload.value]));
        }
    }
};
