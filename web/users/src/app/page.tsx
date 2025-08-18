'use client';

import { useEffect, useState } from 'react';
import { getSpringBase } from '@/lib/springBase'; // evt. relativ import

type User = {
    username: string;
    email?: string;
    name?: string;
};

export default function Page() {
    const [me, setMe] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const SPRING_BASE = getSpringBase();

    const fetchMe = async () => {
        setLoading(true);
        const res = await fetch('/api/bff/users/me', { credentials: 'include' });

        if (res.status === 401 || res.status === 302) {
            // Ikke logget inn → redirect til Spring sitt login-endpoint
            window.location.href = `${SPRING_BASE}/oauth2/authorization/keycloak`;
            return;
        }

        const data = await res.json();
        setMe(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchMe();
    }, []);

    const logout = async () => {
        const csrfToken = document.cookie.replace(/(?:(?:^|.*;\s*)XSRF-TOKEN\s*\=\s*([^;]*).*$)|^.*$/, '$1');

        // Steg 1: logg ut lokalt i Spring – dette er en JSON-respons (ingen 302)
        const res = await fetch(`${SPRING_BASE}/api/bff/logout`, {
            method: 'POST',
            headers: {
                'X-XSRF-TOKEN': csrfToken,
                'Content-Type': 'application/json'
            },
            credentials: 'include',
        });

        if (!res.ok) {
            console.error('Logout feilet', res.status, await res.text());
            alert('Logout feilet – sjekk konsollen');
            return;
        }

        const { endSessionUrl } = await res.json();

        // Steg 2: naviger i nettleseren til IdP end-session (RP-initiated logout)
        window.location.href = endSessionUrl;
    };

    return (
        <main style={{ fontFamily: 'system-ui', padding: 24 }}>
            <h1>Velkommen</h1>

            {loading && <p>Laster...</p>}

            {me ? (
                <>
                    <p>Du er logget inn som: {me.username}</p>
                    <pre style={{ background: '#111', color: '#eee', padding: 12, borderRadius: 8 }}>
                        {JSON.stringify(me, null, 2)}
                    </pre>
                    <button onClick={logout}>Logg ut</button>
                </>
            ) : (
                <button onClick={() => window.location.href = `${SPRING_BASE}/oauth2/authorization/keycloak`}>
                    Logg inn
                </button>
            )}
        </main>
    );
}
