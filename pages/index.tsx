import React, { useState } from "react";
import useSWR, { mutate } from "swr";
import { request } from "graphql-request";

const gql = String.raw;

const API_ENDPOINT = "https://watch-this-db-1.herokuapp.com/v1/graphql";

const GET_SHOWS = gql`
  query GetShows {
    shows(order_by: { id: desc }, where: { isArchived: { _eq: false } }) {
      isCurrent
      platforms
      title
      id
    }
  }
`;

interface ShowProps {
  title: string;
  platforms: string[];
  isCurrent: boolean;
  toggleIsCurrent: () => void;
  archive: () => void;
}

function Show({
  title,
  platforms,
  isCurrent,
  toggleIsCurrent,
  archive,
}: ShowProps) {
  return (
    <div className="flex bg-gray-700 rounded-md shadow-sm">
      <button
        onClick={toggleIsCurrent}
        className={`block p-1 text-gray-100 ${
          isCurrent ? "hover:bg-gray-600" : "hover:bg-gray-800"
        } focus:outline-none focus:shadow-outline rounded-l-md`}
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6 plus">
          {isCurrent ? (
            <path
              fillRule="evenodd"
              d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z"
              clipRule="evenodd"
            />
          ) : (
            <path
              fillRule="evenodd"
              d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
              clipRule="evenodd"
            />
          )}
        </svg>
      </button>
      <div className="w-px bg-gray-600" />
      <button
        onClick={archive}
        className={`block p-1 text-gray-100 ${
          isCurrent ? "hover:bg-gray-600" : "hover:bg-gray-800"
        } focus:outline-none focus:shadow-outline`}
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6 trash">
          <path
            fillRule="evenodd"
            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      <div className="w-px bg-gray-600" />
      <div
        className={`flex flex-wrap items-center flex-1 ${
          isCurrent ? "py-1 px-2" : "p-2"
        }`}
      >
        <p className="p-2 text-lg font-semibold leading-tight tracking-wider text-gray-100">
          {title}
        </p>
        {platforms.map((platform) => (
          <div key={platform} className="p-2">
            <p className="px-2 py-1 text-sm text-gray-100 bg-gray-600 rounded-md shadow-sm">
              {platform}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Shows() {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalFields, setModalFields] = useState({ title: "", platforms: "" });

  const { data, error } = useSWR(GET_SHOWS, (query) => {
    return request(API_ENDPOINT, query);
  });

  if (error)
    return (
      <p className="max-w-full p-4 text-sm text-red-600">{error.message}</p>
    );
  if (data) {
    const richShowsData = data.shows.map((showData) => ({
      ...showData,
      platforms: showData.platforms
        .split(",")
        .map((platform) => platform.trim())
        .filter((v) => v),
      toggleIsCurrent() {
        request(
          API_ENDPOINT,
          gql`
            mutation SetIsCurrent($showId: Int, $isCurrent: Boolean) {
              update_shows(
                where: { id: { _eq: $showId } }
                _set: { isCurrent: $isCurrent }
              ) {
                affected_rows
              }
            }
          `,
          {
            showId: showData.id,
            isCurrent: !showData.isCurrent,
          }
        ).then(() => mutate(GET_SHOWS));
      },
      archive() {
        request(
          API_ENDPOINT,
          gql`
            mutation ArchiveShow($showId: Int!) {
              update_shows_by_pk(
                pk_columns: { id: $showId }
                _set: { isArchived: true }
              ) {
                id
              }
            }
          `,
          {
            showId: showData.id,
          }
        ).then(() => mutate(GET_SHOWS));
      },
    }));

    return (
      <div className="flex flex-col">
        <div className="sticky top-0 px-2 pt-2 bg-white">
          <div
            style={{ maxHeight: "50vh" }}
            className="p-4 space-y-2 overflow-y-auto bg-gray-800 rounded-md shadow-md"
          >
            <h1 className="text-3xl font-semibold leading-tight tracking-wider text-white">
              Current
            </h1>
            {richShowsData
              .filter(({ isCurrent }) => isCurrent)
              .map((showData) => (
                <Show key={showData.id} {...showData} />
              ))}
          </div>
        </div>
        <div className="p-4 space-y-2">
          {richShowsData
            .filter(({ isCurrent }) => !isCurrent)
            .map((showData) => (
              <Show key={showData.id} {...showData} />
            ))}
        </div>
        <div className="absolute bottom-0 left-0 p-2">
          <button
            onClick={() => setModalIsOpen(true)}
            className="p-2 text-white bg-gray-800 rounded-full focus:outline-none hover:bg-gray-900"
          >
            <svg
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-6 h-6 plus"
            >
              <path
                fillRule="evenodd"
                d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
        {modalIsOpen && (
          <div className="absolute inset-0 flex items-center justify-center p-4 bg-gray-800 bg-opacity-50">
            <div className="flex flex-col w-full max-w-md p-4 space-y-2 bg-white rounded-md shadow-md">
              <h1 className="text-3xl font-semibold leading-tight tracking-wider text-gray-700">
                Add A Show
              </h1>
              <input
                placeholder="title"
                className="px-2 py-1 bg-gray-100 border border-gray-600 rounded-md shadow-md focus:outline-none"
                value={modalFields.title}
                onChange={(e) => {
                  e.persist();
                  setModalFields((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }));
                }}
              />
              <input
                className="px-2 py-1 bg-gray-100 border border-gray-600 rounded-md shadow-md focus:outline-none"
                placeholder="platform(s) comma delimited"
                value={modalFields.platforms}
                onChange={(e) => {
                  e.persist();
                  setModalFields((prev) => ({
                    ...prev,
                    platforms: e.target.value,
                  }));
                }}
              />
              <div className="flex overflow-hidden tracking-wider text-gray-800 border border-gray-600 rounded-md shadow-md">
                <button
                  style={{ flex: "2" }}
                  onClick={() => {
                    request(
                      API_ENDPOINT,
                      gql`
                        mutation AddShow($title: String, $platforms: String) {
                          insert_shows_one(
                            object: {
                              isArchived: false
                              isCurrent: false
                              platforms: $platforms
                              title: $title
                            }
                          ) {
                            id
                          }
                        }
                      `,
                      modalFields
                    )
                      .then(() => mutate(GET_SHOWS))
                      .then(() => setModalFields({ title: "", platforms: "" }))
                      .then(() => setModalIsOpen(false));
                  }}
                  className="px-2 py-1 bg-gray-300 hover:bg-gray-600 hover:text-white focus:outline-none"
                >
                  Add
                </button>
                <div className="w-px bg-gray-600" />
                <button
                  style={{ flex: "1" }}
                  onClick={() => {
                    setModalFields({ title: "", platforms: "" });
                    setModalIsOpen(false);
                  }}
                  className="px-2 py-1 bg-gray-300 hover:bg-gray-600 hover:text-white focus:outline-none"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  } else return <p>Loading...</p>;
}

export default Shows;
