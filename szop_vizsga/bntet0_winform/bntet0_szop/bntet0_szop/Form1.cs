using RestSharp;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace bntet0_szop
{
    public partial class Form1 : Form
    {
        String URL = "http://127.0.0.1:3000/motogp/";
        String ROUTE = "";

        public Form1()
        {
            InitializeComponent();
        }

        private void loginBT_Click(object sender, EventArgs e)
        {
            var client = new RestClient(URL);
            ROUTE = "login";
            var request = new RestRequest(ROUTE, Method.POST);
            request.RequestFormat = DataFormat.Json;
            request.AddBody(new User
            {
                usernameCode = usernameTB.Text,
                userpasswordCode = passwordTB.Text
            });
            IRestResponse response = client.Execute(request);
            if (response.Content == "succes_login_admin")
            {
                this.Hide();
                races main = new races();
                main.ShowDialog();
            }
            else if (response.Content == "succes_login")
            {
                this.Hide();
                races main = new races();
                main.ShowDialog();
            }
            else if (response.Content == "incorrect_credentials")
            {
                MessageBox.Show("Your credentials are incorrect! Please check them!");
            }
            else
            {
                MessageBox.Show("Your credentials are mising!");
            }

        }




        public class User
        {
            public int useridCode { get; set; }
            public string usernameCode { get; set; }
            public string userpasswordCode { get; set; }
            public int userisadminCode { get; set; }
        }
    }
}
