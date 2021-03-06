import Certificate from './pki-certificate';
import Ember from 'ember';
import DS from 'ember-data';
import { queryRecord } from 'ember-computed-query';

const { computed } = Ember;
const { attr } = DS;

export default Certificate.extend({
  DISPLAY_FIELDS: [
    'csr',
    'certificate',
    'expiration',
    'issuingCa',
    'caChain',
    'privateKey',
    'privateKeyType',
    'serialNumber',
  ],
  backend: attr('string', {
    readOnly: true,
  }),

  caType: attr('string', {
    possibleValues: ['root', 'intermediate'],
    defaultValue: 'root',
    label: 'CA Type',
    readOnly: true,
  }),
  uploadPemBundle: attr('boolean', {
    label: 'Upload PEM bundle',
    readOnly: true,
  }),
  pemBundle: attr('string', {
    label: 'PEM bundle',
    editType: 'file',
  }),

  fieldDefinition: computed('caType', 'uploadPemBundle', function() {
    const type = this.get('caType');
    const isUpload = this.get('uploadPemBundle');
    let groups = [{ default: ['caType', 'uploadPemBundle'] }];
    if (isUpload) {
      groups[0].default.push('pemBundle');
    } else {
      groups[0].default.push('type', 'commonName');
      if (type === 'root') {
        groups.push({
          Options: [
            'altNames',
            'ipSans',
            'ttl',
            'format',
            'privateKeyFormat',
            'keyType',
            'keyBits',
            'maxPathLength',
            'permittedDnsNames',
            'excludeCnFromSans',
            'ou',
            'organization',
            'otherSans',
          ],
        });
      }
      if (type === 'intermediate') {
        groups.push({
          Options: [
            'altNames',
            'ipSans',
            'format',
            'privateKeyFormat',
            'keyType',
            'keyBits',
            'excludeCnFromSans',
            'ou',
            'organization',
            'otherSans',
          ],
        });
      }
    }
    groups.push({
      'Address Options': ['country', 'locality', 'province', 'streetAddress', 'postalCode'],
    });

    return groups;
  }),

  type: attr('string', {
    possibleValues: ['internal', 'exported'],
    defaultValue: 'internal',
  }),
  ou: attr({
    label: 'OU (OrganizationalUnit)',
    editType: 'stringArray',
  }),
  organization: attr({
    editType: 'stringArray',
  }),
  country: attr({
    editType: 'stringArray',
  }),
  locality: attr({
    editType: 'stringArray',
    label: 'Locality/City',
  }),
  province: attr({
    editType: 'stringArray',
    label: 'Province/State',
  }),
  streetAddress: attr({
    editType: 'stringArray',
  }),
  postalCode: attr({
    editType: 'stringArray',
  }),

  keyType: attr('string', {
    possibleValues: ['rsa', 'ec'],
    defaultValue: 'rsa',
  }),
  keyBits: attr('number', {
    defaultValue: 2048,
  }),
  privateKeyFormat: attr('string', {
    possibleValues: ['', 'der', 'pem', 'pkcs8'],
    defaultValue: '',
  }),
  maxPathLength: attr('number', {
    defaultValue: -1,
  }),
  permittedDnsNames: attr('string', {
    label: 'Permitted DNS domains',
  }),

  csr: attr('string', {
    editType: 'textarea',
    label: 'CSR',
  }),
  expiration: attr(),

  deletePath: queryRecord(
    'capabilities',
    context => {
      const { backend } = context.getProperties('backend');
      return {
        id: `${backend}/root`,
      };
    },
    'backend'
  ),
  canDeleteRoot: computed.and('deletePath.canDelete', 'deletePath.canSudo'),
});
