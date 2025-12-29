// @env: mixed

export const CATEGORY_FRAGMENT = `
  fragment CategoryBasic on CategoryTree {
    uid
    name
    url_path
    include_in_menu
    position
    description
    image
  }
`;

export const CATEGORY_BY_URL_PATH = `
  query CategoryByUrlPath($path: String!) {
    categories(filters: { url_path: { eq: $path } }) {
      items {
        ...CategoryBasic
      }
    }
  }

  ${CATEGORY_FRAGMENT}
`;

export const CATEGORY_BY_UID = `
  query CategoryByUid($uid: String) {
    categories(filters: { uid: { eq: $uid } }) {
      items {
        ...CategoryBasic
      }
    }
  }

  ${CATEGORY_FRAGMENT}
`;
