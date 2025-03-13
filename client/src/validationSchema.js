import * as Yup from 'yup';

const bookSchema = Yup.object().shape({
  title: Yup.string().min(3, 'Title must be at least 3 characters long').required('Title is required'),
  desc: Yup.string().optional(),
  price: Yup.number().required('Price is required'),
  cover: Yup.string().url('Cover must be a valid URL').optional(),
  unique_id: Yup.string().optional(),
});

export { bookSchema };