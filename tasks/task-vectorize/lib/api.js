import fetch from 'node-fetch';

/**
 * @class
 */
class Iteration {
    constructor(url, token) {
        if (!url) throw new Error('MLEnabler Url not provided');
        if (!token) throw new Error('MLEnabler Token not provided');

        this.url = new URL(url);
        this.token = token;
    }

    async from(id) {
        const res = await fetch(new URL(`/api/iteration/${id}`, this.url), {
            method: 'GET',
            headers: {
                Authorization: 'Bearer ' + this.token
            }
        });

        return await res.json();
    }
}

/**
 * @class
 */
class MLEnabler {
    constructor(url, token) {
        if (!url) throw new Error('MLEnabler Url not provided');
        if (!token) throw new Error('MLEnabler Token not provided');

        this.url = new URL(url);
        this.token = token;

        this.iteration = new Iteration(url, token);
    }


}

export {
    MLEnabler as default,
    Iteration
};
