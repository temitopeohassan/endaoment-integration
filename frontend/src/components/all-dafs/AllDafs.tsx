import { queryOptions, useQuery } from '@tanstack/react-query';
import { getEnvOrThrow } from '../../utils/env';
import type { Daf } from '../../utils/endaoment-types';
import './AllDafs.css';
import { useReducer, useState } from 'react';
import { DONATE_BOX_ID, DonateBox } from './DonateBox';
import { GRANT_BOX_ID, GrantBox } from './GrantBox';
import { getEndaomentUrls } from '../../utils/endaoment-urls';

const allDafsQueryOptions = queryOptions({
  queryKey: ['All DAFs'],
  queryFn: async (): Promise<Daf[]> => {
    const response = await fetch(
      `${getEnvOrThrow('SAFE_BACKEND_URL')}/get-dafs`,
      { credentials: 'include' }
    );
    const list = await response.json();

    if (!Array.isArray(list)) {
      throw new Error('Invalid response');
    }

    return list;
  },
});

export const AllDafs = () => {
  const allDafsResponse = useQuery(allDafsQueryOptions);

  const [focusedDaf, setFocusedDaf] = useReducer(
    (_prev: Daf | undefined, nextId: string) => {
      if (!allDafsResponse.data) return undefined;

      const foundDaf = allDafsResponse.data.find((daf) => daf.id === nextId);
      if (!foundDaf) return undefined;
      return foundDaf;
    },
    undefined
  );
  const [isShowingDonateBox, setIsShowingDonateBox] = useState(false);
  const [isShowingGrantBox, setIsShowingGrantBox] = useState(false);

  const handleDonate = (id: string) => {
    setFocusedDaf(id);
    setIsShowingDonateBox(true);
    setIsShowingGrantBox(false);
    document.getElementById(DONATE_BOX_ID)?.scrollIntoView();
  };
  const handleGrant = (id: string) => {
    setFocusedDaf(id);
    setIsShowingGrantBox(true);
    setIsShowingDonateBox(false);
    document.getElementById(GRANT_BOX_ID)?.scrollIntoView();
  };

  return (
    <>
      {isShowingDonateBox && focusedDaf && <DonateBox daf={focusedDaf} />}
      {isShowingGrantBox && focusedDaf && <GrantBox daf={focusedDaf} />}
      {allDafsResponse.data && (
        <ul className="daf-list">
          {allDafsResponse.data.map((daf) => (
            <li className="box" key={daf.id}>
              <a href={`${getEndaomentUrls().app}/funds/${daf.id}`}>
                {daf.name}
              </a>
              <p>{daf.description}</p>
              <p>
                Balance: ${Number(BigInt(daf.usdcBalance)) / 1_000_000} USDC
              </p>
              <div className="daf-buttons">
                <button onClick={() => handleDonate(daf.id)} type="button">
                  Donate
                </button>
                <button
                  onClick={() => handleGrant(daf.id)}
                  type="button"
                  disabled={BigInt(daf.usdcBalance) === 0n}>
                  Grant
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
};
